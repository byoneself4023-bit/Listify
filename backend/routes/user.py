from flask import Blueprint
from controllers import user as user_controller

user_bp = Blueprint('user', __name__, url_prefix='/users')

@user_bp.route('/<int:user_no>/profile', methods=['GET'])
def get_profile(user_no):
    """프로필 조회"""
    return user_controller.get_profile(user_no)

@user_bp.route('/<int:user_no>/profile', methods=['PUT'])
def update_profile(user_no):
    """프로필 수정"""
    return user_controller.update_profile(user_no)

@user_bp.route('/<int:user_no>', methods=['DELETE'])
def delete_account(user_no):
    """계정 탈퇴"""
    return user_controller.delete_account(user_no)

@user_bp.route('/<int:user_no>/stats', methods=['GET'])
def get_user_stats(user_no):
    """사용자 통계 조회 (장르 분포, 주간 활동, 음악적 특성)"""
    return user_controller.get_user_stats(user_no)