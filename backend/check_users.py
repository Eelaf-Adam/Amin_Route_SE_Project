#!/usr/bin/env python3
import os
import sys
import json
import argparse

# Ensure backend root directory is in sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

from app.db import SessionLocal
from app.models import User
from sqlalchemy.exc import OperationalError, SQLAlchemyError

def check_users(as_json: bool = False, show_hash: bool = False):
    db = SessionLocal()
    try:
        users = db.query(User).all()
        
        if as_json:
            user_list = []
            for user in users:
                u_dict = {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "language_pref": user.language_pref,
                    "created_at": user.created_at.isoformat() if user.created_at else None,
                }
                if show_hash:
                    u_dict["password_hash"] = user.password_hash
                user_list.append(u_dict)
            print(json.dumps(user_list, indent=2))
            return

        print("=" * 115)
        print("                                      DATABASE USER CHECKER")
        print("=" * 115)

        if not users:
            print("[!] No users found in the database.")
            print("=" * 115)
            return

        print(f"[+] Found {len(users)} user(s) in the database:\n")
        
        if show_hash:
            print(f"{'ID':<38} | {'Name':<18} | {'Email':<28} | {'Lang':<5} | {'Created At':<19} | {'Password Hash'}")
            print("-" * 140)
            for user in users:
                created_str = user.created_at.strftime("%Y-%m-%d %H:%M:%S") if user.created_at else "N/A"
                print(f"{user.id:<38} | {user.name:<18} | {user.email:<28} | {user.language_pref:<5} | {created_str:<19} | {user.password_hash}")
            print("=" * 140)
        else:
            print(f"{'ID':<38} | {'Name':<20} | {'Email':<30} | {'Lang':<5} | {'Created At'}")
            print("-" * 115)
            for user in users:
                created_str = user.created_at.strftime("%Y-%m-%d %H:%M:%S") if user.created_at else "N/A"
                print(f"{user.id:<38} | {user.name:<20} | {user.email:<30} | {user.language_pref:<5} | {created_str}")
            print("=" * 115)

        print(f"Total User Count: {len(users)}")
        
    except OperationalError as e:
        print("[X] Database Connection Error: Unable to connect to PostgreSQL database.")
        print("    Please ensure PostgreSQL is running and check connection parameters in backend/.env.")
        print(f"    Details: {e}")
    except SQLAlchemyError as e:
        print(f"[X] Database Query Error: {e}")
    except Exception as e:
        print(f"[X] An unexpected error occurred: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Check users stored in the database.")
    parser.add_argument("--json", action="store_true", help="Output results in JSON format")
    parser.add_argument("--show-hash", action="store_true", help="Include password hashes in output")
    args = parser.parse_args()

    check_users(as_json=args.json, show_hash=args.show_hash)
