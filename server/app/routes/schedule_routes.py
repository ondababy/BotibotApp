from flask import Blueprint
from app.controllers.schedule_controller import (
    create_schedule, get_all_schedules, get_schedule,
    update_schedule, delete_schedule, log_medication,
    get_medication_logs, get_today_schedules
)

schedule_bp = Blueprint('schedule', __name__, url_prefix='/api')

# Schedule routes
schedule_bp.route('/schedule', methods=['POST'])(create_schedule)
schedule_bp.route('/schedule', methods=['GET'])(get_all_schedules)
schedule_bp.route('/schedule/today', methods=['GET'])(get_today_schedules)
schedule_bp.route('/schedule/<schedule_id>', methods=['GET'])(get_schedule)
schedule_bp.route('/schedule/<schedule_id>', methods=['PUT'])(update_schedule)
schedule_bp.route('/schedule/<schedule_id>', methods=['DELETE'])(delete_schedule)

# Medication log routes
schedule_bp.route('/medication/log', methods=['POST'])(log_medication)
schedule_bp.route('/medication/logs', methods=['GET'])(lambda: get_medication_logs(None))
schedule_bp.route('/medication/logs/<schedule_id>', methods=['GET'])(get_medication_logs)