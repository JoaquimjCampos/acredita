from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Simulator, SimulatorSession
from .scenario import Scenario

@api_view(['GET'])
def simulator_analytics(request, simulator_id):
    simulator = Simulator.objects.get(id=simulator_id)
    sessions = SimulatorSession.objects.filter(simulator=simulator)
    total_sessions = sessions.count()
    completion_rate = sessions.filter(finished_at__isnull=False).count() / total_sessions if total_sessions else 0
    # Most chosen choices per scenario
    scenario_stats = {}
    for scenario in simulator.scenarios.all():
        choice_counts = {}
        for session in sessions:
            choices = session.input_data.get('choices', [])
            for choice in choices:
                if choice.get('scenario_id') == scenario.id:
                    label = choice.get('label')
                    choice_counts[label] = choice_counts.get(label, 0) + 1
        scenario_stats[scenario.id] = {
            'title': scenario.title,
            'choices': choice_counts
        }
    # Average result (if numeric)
    avg_result = None
    results = [s.result_data.get('final_balance') for s in sessions if 'final_balance' in s.result_data]
    if results:
        avg_result = sum(results) / len(results)
    # Streak logic: max consecutive completions per user
    from collections import defaultdict
    user_sessions = defaultdict(list)
    for s in sessions.order_by('user', 'started_at'):
        user_sessions[s.user_id].append(s)
    import datetime
    leaderboard = []
    for user_id, sess_list in user_sessions.items():
        # Streak by day
        streak = 0
        max_streak = 0
        last_finished = None
        # Streak by week
        week_streak = 0
        max_week_streak = 0
        last_week = None
        # Streak by scenario (max consecutive completions of a scenario)
        scenario_streaks = {}
        for s in sess_list:
            if s.finished_at:
                # By day
                if last_finished and (s.started_at - last_finished).days == 1:
                    streak += 1
                else:
                    streak = 1
                last_finished = s.started_at
                if streak > max_streak:
                    max_streak = streak
                # By week
                week = s.started_at.isocalendar()[1]
                if last_week and week == last_week + 1:
                    week_streak += 1
                else:
                    week_streak = 1
                last_week = week
                if week_streak > max_week_streak:
                    max_week_streak = week_streak
                # By scenario
                choices = s.input_data.get('choices', [])
                for choice in choices:
                    sc_id = choice.get('scenario_id')
                    if sc_id:
                        scenario_streaks[sc_id] = scenario_streaks.get(sc_id, 0) + 1
            else:
                streak = 0
                week_streak = 0
        # Score logic: use result_data['final_balance'] if available, else 0
        score = s.result_data.get('final_balance', 0) if hasattr(s, 'result_data') and s.result_data else 0
        user_obj = getattr(sess_list[0], 'user', None)
        leaderboard.append({
            'user': {
                'id': str(user_id),
                'nome': getattr(user_obj, 'first_name', '') or getattr(user_obj, 'username', ''),
                'foto_perfil': getattr(user_obj, 'foto_perfil', None)
            },
            'score': score,
            'finished_at': sess_list[-1].finished_at if sess_list else None,
            'streak': max_streak,
            'week_streak': max_week_streak,
            'scenario_streaks': scenario_streaks
        })
    # Map scenario IDs to names
    scenario_map = {str(s.id): s.title for s in simulator.scenarios.all()}
    # Prepare scenario stats for charting
    scenario_chart = []
    for sc_id, stats in scenario_stats.items():
        total = sum(stats['choices'].values())
        scenario_chart.append({
            'id': sc_id,
            'title': stats['title'],
            'choices': stats['choices'],
            'total': total
        })
    return Response({
        'completion_rate': completion_rate,
        'scenario_stats': scenario_stats,
        'scenario_chart': scenario_chart,
        'average_result': avg_result,
        'total_sessions': total_sessions,
        'leaderboard': leaderboard,
        'scenario_map': scenario_map
    })

@api_view(['GET'])
def simulator_session_replay(request, session_id):
    session = SimulatorSession.objects.get(id=session_id)
    return Response({
        'simulator': session.simulator.title,
        'input_data': session.input_data,
        'result_data': session.result_data,
        'choices': session.input_data.get('choices', []),
        'feedback': session.feedback,
        'started_at': session.started_at,
        'finished_at': session.finished_at
    })
