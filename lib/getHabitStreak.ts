type HabitRecord = {
  date: Date;
};

export function getHabitStreak(records: HabitRecord[]) {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  let streak = 0;

  const currentDate = new Date(today);

  while (true) {
    const exists = records.some((record) => {
      const d = new Date(record.date);

      d.setHours(0, 0, 0, 0);

      return d.getTime() === currentDate.getTime();
    });

    if (!exists) {
      break;
    }

    streak++;

    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
}
