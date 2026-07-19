"""
Student Profile API — Flask + MongoDB
CRUD operations demonstrating multiple data types:
  - name          : string
  - email         : string
  - age           : integer (number)
  - studentClass  : string
  - dateOfBirth   : date (stored as datetime, sent/received as ISO string)
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient, ReturnDocument
from bson import ObjectId
from bson.errors import InvalidId
from datetime import datetime, date

app = Flask(__name__)
CORS(app)  # allow the React (TypeScript) frontend to call this API

# ---- MongoDB connection ----
client = MongoClient("mongodb://127.0.0.1:27017/")
db = client["school_db"]
students = db["students"]


# ---- Helpers ----
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Student Profile API is running",
        "version": "1.0",
        "status": "OK",
        "endpoints": [
            "/api/students",
            "/api/students/<student_id>"
        ]
    })

def serialize_student(doc: dict) -> dict:
    """Convert a MongoDB document into a JSON-safe dict."""
    return {
        "id": str(doc["_id"]),
        "name": doc.get("name"),
        "email": doc.get("email"),
        "age": doc.get("age"),
        "studentClass": doc.get("studentClass"),
        "dateOfBirth": doc.get("dateOfBirth").strftime("%Y-%m-%d") if doc.get("dateOfBirth") else None,
    }


def validate_student_payload(data: dict, partial: bool = False) -> tuple[dict, str]:
    """
    Validates and casts incoming JSON into correct Python/Mongo types.
    Returns (cleaned_data, error_message). error_message is "" if valid.
    """
    cleaned = {}

    # name -> string
    if "name" in data:
        if not isinstance(data["name"], str) or not data["name"].strip():
            return {}, "name must be a non-empty string"
        cleaned["name"] = data["name"].strip()
    elif not partial:
        return {}, "name is required"

    # email -> string
    if "email" in data:
        if not isinstance(data["email"], str) or "@" not in data["email"]:
            return {}, "email must be a valid string"
        cleaned["email"] = data["email"].strip()
    elif not partial:
        return {}, "email is required"

    # age -> integer
    if "age" in data:
        try:
            age_val = int(data["age"])
            if age_val <= 0 or age_val > 120:
                return {}, "age must be a realistic positive integer"
            cleaned["age"] = age_val
        except (ValueError, TypeError):
            return {}, "age must be a number"
    elif not partial:
        return {}, "age is required"

    # studentClass -> string
    if "studentClass" in data:
        if not isinstance(data["studentClass"], str) or not data["studentClass"].strip():
            return {}, "studentClass must be a non-empty string"
        cleaned["studentClass"] = data["studentClass"].strip()
    elif not partial:
        return {}, "studentClass is required"

    # dateOfBirth -> date/datetime
    if "dateOfBirth" in data:
        try:
            parsed_date = datetime.strptime(data["dateOfBirth"], "%Y-%m-%d")
            if parsed_date.date() > date.today():
                return {}, "dateOfBirth cannot be in the future"
            cleaned["dateOfBirth"] = parsed_date
        except (ValueError, TypeError):
            return {}, "dateOfBirth must be in YYYY-MM-DD format"
    elif not partial:
        return {}, "dateOfBirth is required"

    return cleaned, ""


# ---- Routes ----

@app.route("/api/students", methods=["GET"])
def get_students():
    """READ (all)"""
    all_students = [serialize_student(doc) for doc in students.find()]
    return jsonify(all_students), 200


@app.route("/api/students/<student_id>", methods=["GET"])
def get_student(student_id):
    """READ (one)"""
    try:
        doc = students.find_one({"_id": ObjectId(student_id)})
    except InvalidId:
        return jsonify({"error": "Invalid student id"}), 400

    if not doc:
        return jsonify({"error": "Student not found"}), 404
    return jsonify(serialize_student(doc)), 200


@app.route("/api/students", methods=["POST"])
def create_student():
    """CREATE"""
    data = request.get_json(silent=True) or {}
    cleaned, error = validate_student_payload(data)
    if error:
        return jsonify({"error": error}), 400

    result = students.insert_one(cleaned)
    new_doc = students.find_one({"_id": result.inserted_id})
    return jsonify(serialize_student(new_doc)), 201


@app.route("/api/students/<student_id>", methods=["PUT"])
def update_student(student_id):
    """UPDATE"""
    try:
        obj_id = ObjectId(student_id)
    except InvalidId:
        return jsonify({"error": "Invalid student id"}), 400

    data = request.get_json(silent=True) or {}
    cleaned, error = validate_student_payload(data, partial=True)
    if error:
        return jsonify({"error": error}), 400
    if not cleaned:
        return jsonify({"error": "No valid fields provided to update"}), 400

    updated_doc = students.find_one_and_update(
        {"_id": obj_id},
        {"$set": cleaned},
        return_document=ReturnDocument.AFTER,
    )
    if not updated_doc:
        return jsonify({"error": "Student not found"}), 404

    return jsonify(serialize_student(updated_doc)), 200


@app.route("/api/students/<student_id>", methods=["DELETE"])
def delete_student(student_id):
    """DELETE"""
    try:
        obj_id = ObjectId(student_id)
    except InvalidId:
        return jsonify({"error": "Invalid student id"}), 400

    result = students.delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        return jsonify({"error": "Student not found"}), 404

    return jsonify({"message": "Student deleted"}), 200


if __name__ == "__main__":
    app.run(debug=True, port=5000)