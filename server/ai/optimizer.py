  
import json
import sys
from datetime import datetime

# 📥 Input tasks from Node
tasks = json.loads(sys.argv[1])

# 🧠 Priority Calculation
def calculate_priority(task):
    deadline = datetime.strptime(task["deadline"], "%Y-%m-%d")
    today = datetime.today()

    days_left = (deadline - today).days

    # Avoid division by zero
    urgency = 1 if days_left <= 0 else 1 / days_left

    difficulty_weight = int(task.get("difficulty", 1))

    # Final score
    score = urgency * 0.6 + difficulty_weight * 0.4

    return score

# 🔥 Sort tasks by priority (high → low)
tasks_sorted = sorted(
    tasks,
    key=lambda x: calculate_priority(x),
    reverse=True
)

# 📅 Generate Study Plan
schedule = []
current_day = 1

for task in tasks_sorted:
    hours = int(task.get("difficulty", 1)) * 2

    schedule.append({
        "day": current_day,
        "subject": task["subject"],
        "hours": hours,
        "priority_score": round(calculate_priority(task), 2)
    })

    current_day += 1

# 📤 Output result
print(json.dumps(schedule))