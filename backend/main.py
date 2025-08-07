from flask import request, jsonify
from config import app, db
from models import Contact

from OpenverseAPIClient import OpenverseClient


@app.route("/contacts", methods=["GET"])
def get_contacts():
    contacts = Contact.query.all()
    json_contacts = list(map(lambda x: x.to_json(), contacts))
    return jsonify({"contacts": json_contacts})


@app.route("/create_contact", methods=["POST"])
def create_contact():
    user_name = request.json.get("username")
    pass_word = request.json.get("password")
    role = request.json.get("role")

    if not user_name or not pass_word or not role:
        return (
            jsonify({"message": "You must include the username, password and role"}),
            400,
        )
    
    existing = Contact.query.filter_by(user_name=user_name).first()
    if existing:
        return jsonify({"message": "Username already exists"}), 400

    new_contact = Contact(user_name=user_name, pass_word=pass_word, role=role)
    try:
        db.session.add(new_contact)
        db.session.commit()
    except Exception as e:
        return jsonify({"message": str(e)}), 400

    return jsonify({"message": "User created!"}), 201


@app.route("/update_contact/<int:user_id>", methods=["PATCH"])
def update_contact(user_id):
    contact = Contact.query.get(user_id)
    if not contact:
        return jsonify({"message": "User not found"}), 404

    data = request.json
    contact.user_name = data.get("username", contact.user_name)
    contact.pass_word = data.get("password", contact.pass_word)
    contact.role = data.get("role", contact.role)

    db.session.commit()

    return jsonify({"message": "User updated"}), 200


@app.route("/delete_contact/<int:user_id>", methods=["DELETE"])
def delete_contact(user_id):
    contact = Contact.query.get(user_id)

    if not contact:
        return jsonify({"message": "User not found"}), 404

    db.session.delete(contact)
    db.session.commit()

    return jsonify({"message": "User deleted"}), 200

ov_client = OpenverseClient()

@app.route("/search_images", methods=["GET"])
def search_images():
    """
    Endpoint to search for images using the OpenVerse API
    Query parameters:
    - q: Search query (required)
    - page: Page number (default: 1)
    - page_size: Results per page (default: 20)
    - license: Filter by license type
    - creator: Filter by creator
    - tags: Comma-separated list of tags
    """
    query = request.args.get("q")
    if not query:
        return jsonify({"error": "Search query is required"}), 400
    
    page = request.args.get("page", 1, type=int)
    page_size = request.args.get("page_size", 20, type=int)
    license_type = request.args.get("license")
    creator = request.args.get("creator")
    
    # Handle tags as a comma-separated list
    tags = request.args.get("tags")
    if tags:
        tags = tags.split(",")
    
    results = ov_client.search_images(
        query=query,
        page=page,
        page_size=page_size,
        license_type=license_type,
        creator=creator,
        tags=tags
    )
    
    return jsonify(results)

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    user_name = data.get("username")
    pass_word = data.get("password")

    if not user_name or not pass_word:
        return jsonify({"message": "Username and password required!"}), 400

    user = Contact.query.filter_by(user_name=user_name).first()

    if not user or user.pass_word != pass_word:
        return jsonify({"message": "Incorrect username or password!"}), 401

    return jsonify({
        "message": "Login successful",
        "user": {
            "id": user.id,
            "username": user.user_name,
            "role": user.role
        }
    }), 200



if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(host="0.0.0.0", port=5000, debug=True)