from apscheduler.schedulers.blocking import BlockingScheduler
from fData_Updater import update

sched = BlockingScheduler()

@sched.scheduled_job('cron', day_of_week='mon-sun', hour=8)
def scheduled_job():
    update()

sched.start()
