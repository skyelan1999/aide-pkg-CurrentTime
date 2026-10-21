'use strict';

function partsMap(parts) {
  return Object.fromEntries(parts.map(part => [part.type, part.value]));
}

function dateTimeInZone(now, timeZone) {
  // Construct fields explicitly so output remains stable across Node/ICU locales.
  const date = partsMap(new Intl.DateTimeFormat('en', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now));
  const time = partsMap(new Intl.DateTimeFormat('en', {
    timeZone, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(now));
  return {
    date: `${date.year}-${date.month}-${date.day}`,
    time: `${time.hour}:${time.minute}:${time.second}`,
  };
}

function isoWeekForDate(dateText) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateText);
  if (!match) throw new RangeError('date must use YYYY-MM-DD');
  const year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
  const instant=new Date(0);instant.setUTCHours(0,0,0,0);instant.setUTCFullYear(year,month-1,day);const timestamp=instant.getTime();
  if (year<1 || new Date(timestamp).toISOString().split('T')[0] !== dateText) throw new RangeError('date is not a valid calendar date');

  const weekday = new Date(timestamp).getUTCDay() || 7; // ISO: Monday=1 … Sunday=7
  const monday = timestamp - (weekday - 1) * 86400000;
  const thursday = timestamp + (4 - weekday) * 86400000;
  const weekYear = new Date(thursday).getUTCFullYear();
  const jan4Date=new Date(0);jan4Date.setUTCHours(0,0,0,0);jan4Date.setUTCFullYear(weekYear,0,4);const jan4=jan4Date.getTime();
  const jan4Weekday = new Date(jan4).getUTCDay() || 7;
  const firstMonday = jan4 - (jan4Weekday - 1) * 86400000;
  return {
    weekYear,
    weekNumber: Math.floor((monday - firstMonday) / (7 * 86400000)) + 1,
    weekStart: new Date(monday).toISOString().split('T')[0],
    weekEnd: new Date(monday + 6 * 86400000).toISOString().split('T')[0],
    standard: 'ISO-8601',
  };
}

function validatedTimeZone(value, fallback) {
  if(value!==undefined&&(typeof value!=='string'||!value.trim()))throw TypeError('timeZone must be a non-empty IANA timezone');
  const timeZone = value===undefined?fallback:value.trim();
  new Intl.DateTimeFormat('en', { timeZone });
  return timeZone;
}

module.exports = {
  name: 'current-time',
  apply(ctx) {
    ctx.tool({
      name: 'get_current_datetime',
      description: 'Get the current date, time, timezone, and ISO-8601 week number. Returns the UTC ISO timestamp and local date/time; optionally provide an IANA timezone such as Asia/Shanghai.',
      parameters: {
        type: 'object',
        properties: {
          timeZone: {
            type: 'string',
            description: 'Optional IANA timezone (for example Asia/Shanghai). Defaults to the runtime local timezone.',
          },
        },
      },
      handler(args = {}) {
        if(args===null||typeof args!=='object'||Array.isArray(args))throw TypeError('args must be an object');
        const now = new Date();
        const runtimeTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
        const timeZone = validatedTimeZone(args.timeZone, runtimeTimeZone);
        const local = dateTimeInZone(now, timeZone);
        return {
          date: local.date,
          time: local.time,
          timeZone,
          isoWeek: isoWeekForDate(local.date),
          isoUtc: now.toISOString(),
          unixMs: now.getTime(),
          clockSource:'aide-host-system-clock',
          runtimeTimeZone,
          note:'主机系统时钟，不是SSH设备时钟；未通过网络授时校验。',
        };
      },
    });
    ctx.tool({
      name: 'get_week_number',
      description: 'Calculate the ISO-8601 calendar week number. With no date, returns the current week in the requested IANA timezone (or runtime local timezone); with date, calculate that YYYY-MM-DD date.',
      parameters: {
        type: 'object',
        properties: {
          date: { type: 'string', description: 'Optional calendar date in YYYY-MM-DD form; defaults to today in the selected timezone.' },
          timeZone: { type: 'string', description: 'Optional IANA timezone, for example Asia/Shanghai; defaults to runtime local timezone.' },
        },
      },
      handler(args = {}) {
        if(args===null||typeof args!=='object'||Array.isArray(args))throw TypeError('args must be an object');
        const runtimeTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
        const timeZone = validatedTimeZone(args.timeZone, runtimeTimeZone);
        if(args.date!==undefined&&(typeof args.date!=='string'||!args.date))throw TypeError('date must use YYYY-MM-DD');
        const date = args.date===undefined?dateTimeInZone(new Date(), timeZone).date:args.date;
        return { date, timeZone, ...isoWeekForDate(date) };
      },
    });
    ctx.slot?.({id:'current-time-workbench',name:'时间工作台'});
  },
};
