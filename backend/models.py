from config import db


class Contact(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_name   = db.Column(db.String(80), unique=True, nullable=False)
    pass_word    = db.Column(db.String(80), unique=False, nullable=False)
    role        = db.Column(db.String(120), unique=False, nullable=False)

    def to_json(self):
        return {
            "id": self.id,
            "username": self.user_name,
            "password": self.pass_word,
            "role": self.role,
        }
    
