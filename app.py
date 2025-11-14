from flask import Flask, render_template, request, jsonify, redirect, url_for, session, flash
import sqlite3
import os
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'dev-secret-key')
DB_PATH = os.environ.get('PRODUCTS_DB_PATH', os.path.join(os.path.dirname(__file__), 'app.db'))


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            phone TEXT,
            created_at TEXT NOT NULL
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            created_at TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
            comment TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
        """
    )
    conn.commit()
    conn.close()


products = [
    {"name": "پیراهن قهوه‌ای", "price": "250,000 تومان", "image": "image/brown dress.jpg", "description": "پیراهن زنانه قهوه‌ای با فرم راحت و پارچه باکیفیت"},
    {"name": "پیراهن بافت زانانه قهوه ای", "price": "350,000 تومان", "image": "image/brown shirt.jpg", "description": "پیراهن بافت زنانه شیک و کلاسیک مناسب روزمره و رسمی"},
    {"name": "دامن قهوه‌ای", "price": "200,000 تومان", "image": "image/brown skirt.jpg", "description": "دامن کوتاه قهوه‌ای با طراحی مینیمال"},
    {"name": "تاپ قهوه‌ای", "price": "150,000 تومان", "image": "image/brown top .jpg", "description": "تاپ سبک و راحت برای استفاده روزمره"},
    {"name": "شلوار بگ", "price": "180,000 تومان", "image": "image/long trousers.jpg", "description": "شلوار بلند با دوخت تمیز و پارچه مقاوم"},
    {"name": "شلوار راسته", "price": "220,000 تومان", "image": "image/straight pants.jpg", "description": "‌شلوار راسته کلاسیک با تنخور عالی"},
    {"name": "پیراهن سفید", "price": "420,000 تومان", "image": "image/white dress.jpg", "description": "پیراهن سفید مینیمال مناسب مهمانی و روزمره"},
]

# Recommended products for cart page
recommended_products = products[:3]

@app.route('/')
def index():
    return render_template('index.html', products=products)

# صفحه درباره ما حذف شد بنا به درخواست

@app.route('/contact')
def contact():
    return render_template('contact.html')



@app.route('/cart')
def cart():
    return render_template('cart.html', recommended_products=recommended_products)


@app.route('/size-guide')
def size_guide():
    return render_template('size_guide.html')

@app.route('/shipping')
def shipping():
    return render_template('shipping.html')

@app.route('/privacy')
def privacy():
    return render_template('privacy.html')

@app.route('/product/<int:product_id>')
def product_detail(product_id):
    if 0 <= product_id < len(products):
        product = products[product_id]
        # Get related products (exclude current product)
        related_products = [p for i, p in enumerate(products) if i != product_id][:3]
        # Load reviews
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT r.*, u.username FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.product_id = ? ORDER BY r.id DESC", (product_id,))
        reviews = cur.fetchall()
        conn.close()
        return render_template('product_detail.html', product=product, related_products=related_products, product_id=product_id, reviews=reviews)
    else:
        return "محصول یافت نشد", 404


# Checkout: create orders from cart (expects JSON {items: [{name, quantity}]})
@app.route('/checkout', methods=['POST'])
def checkout():
    if not session.get('user_id'):
        return jsonify({"error": "unauthorized"}), 401
    data = request.get_json(silent=True) or {}
    items = data.get('items', [])
    if not isinstance(items, list) or not items:
        return jsonify({"error": "empty_cart"}), 400
    # Map product name to index (product_id)
    name_to_id = {p['name']: i for i, p in enumerate(products)}
    conn = get_db()
    cur = conn.cursor()
    created = 0
    for item in items:
        try:
            name = str(item.get('name', '')).strip()
            qty = int(item.get('quantity', 1))
        except Exception:
            continue
        if not name or qty <= 0:
            continue
        if name not in name_to_id:
            continue
        product_id = name_to_id[name]
        qty = max(1, min(qty, 10))
        cur.execute(
            "INSERT INTO orders(user_id, product_id, quantity, status, created_at) VALUES(?,?,?,?,?)",
            (session['user_id'], product_id, qty, 'pending', datetime.utcnow().isoformat()),
        )
        created += 1
    conn.commit()
    conn.close()
    if created == 0:
        return jsonify({"error": "no_valid_items"}), 400
    return jsonify({"ok": True, "created": created})

# Auth routes
@app.route('/signup', methods=['GET', 'POST'])                             
def signup():
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '').strip()
        phone = request.form.get('phone', '').strip()
        if not username or not password:
            return render_template('signup.html', error='نام کاربری و رمز عبور الزامی است')
        pw_hash = generate_password_hash(password)
        try:
            conn = get_db()
            cur = conn.cursor()
            cur.execute(
                "INSERT INTO users(username, password, phone, created_at) VALUES(?,?,?,?)",
                (username, pw_hash, phone, datetime.utcnow().isoformat()),
            )
            conn.commit()
            user_id = cur.lastrowid
            conn.close()
        except sqlite3.IntegrityError:
            return render_template('signup.html', error='این نام کاربری قبلاً ثبت شده است')
        session['user_id'] = user_id
        session['username'] = username
        flash(f"{username} عزیز، خوش آمدید!", "success")
        return redirect(url_for('index'))
    return render_template('signup.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '').strip()
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT * FROM users WHERE username = ?", (username,))
        user = cur.fetchone()
        conn.close()
        if user and check_password_hash(user['password'], password):
            session['user_id'] = user['id']
            session['username'] = user['username']
            flash(f"{user['username']} عزیز، خوش آمدید!", "success")
            return redirect(url_for('index'))
        return render_template('login.html', error='نام کاربری یا رمز عبور نادرست است')
    return render_template('login.html')


@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))


# Orders
@app.route('/order', methods=['POST'])
def create_order():
    if not session.get('user_id'):
        return redirect(url_for('login'))
    try:
        product_id = int(request.form.get('product_id'))
        quantity = int(request.form.get('quantity', '1'))
    except (TypeError, ValueError):
        return redirect(url_for('index'))
    if product_id < 0 or product_id >= len(products):
        return redirect(url_for('index'))
    quantity = max(1, min(quantity, 10))
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO orders(user_id, product_id, quantity, status, created_at) VALUES(?,?,?,?,?)",
        (session['user_id'], product_id, quantity, 'pending', datetime.utcnow().isoformat()),
    )
    conn.commit()
    conn.close()
    return redirect(url_for('cart'))


# Reviews
@app.route('/review/<int:product_id>', methods=['POST'])
def submit_review(product_id):
    if not session.get('user_id'):
        return redirect(url_for('login'))
    if product_id < 0 or product_id >= len(products):
        return redirect(url_for('index'))
    try:
        rating = int(request.form.get('rating', '5'))
    except ValueError:
        rating = 5
    rating = max(1, min(rating, 5))
    comment = request.form.get('comment', '').strip()
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO reviews(user_id, product_id, rating, comment, created_at) VALUES(?,?,?,?,?)",
        (session['user_id'], product_id, rating, comment, datetime.utcnow().isoformat()),
    )
    conn.commit()
    conn.close()
    return redirect(url_for('product_detail', product_id=product_id))


if __name__ == '__main__':
    init_db()
    app.run(debug=True)
    