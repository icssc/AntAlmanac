ALTER TABLE "coursesInSchedule" ADD CONSTRAINT "visibility_check" CHECK ("coursesInSchedule"."visibility" IN ('visible', 'outlined', 'disappeared'));
