
import json
import sys
from datetime import datetime, timedelta

# 📥 Get optimized tasks from Node
tasks = json.loads(sys.argv[1])

# ⏰ Time slots
TIME_SLOTS = [
    ("Morning", "08:00 - 10:00"),
    ("Afternoon", "12:00 - 14:00"),
    ("Evening", "16:00 - 18:00"),
    ("Night", "20:00 - 22:00"),
]

# 📅 Start from today
current_date = datetime.today()

schedule = []
slot_index = 0

for task in tasks:
    subject = task["subject"]
    hours = task.get("hours", 2)

    # Number of sessions needed (each slot ≈ 2 hours)
    sessions = max(1, hours // 2)

    for _ in range(sessions):
        day_str = current_date.strftime("%Y-%m-%d")

        slot_name, slot_time = TIME_SLOTS[slot_index]

        schedule.append({
            "date": day_str,
            "subject": subject,
            "slot": slot_name,
            "time": slot_time
        })

        # Move to next slot
        slot_index += 1

        # If all slots used → next day
        if slot_index >= len(TIME_SLOTS):
            slot_index = 0
            current_date += timedelta(days=1)

# 📤 Output schedule
print(json.dumps(schedule))