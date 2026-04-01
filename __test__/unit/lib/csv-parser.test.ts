import { describe, it, expect } from 'vitest'
import { parseCSV, type ParsedSleepData } from '@/lib/csv-parser'

describe('csv-parser', () => {
  describe('parseCSV', () => {
    it('should parse valid CSV with standard headers', async () => {
      const csvText = `date,bedTime,wakeTime,sleepDuration,deepSleep,lightSleep,remSleep,awakeCount,sleepScore,heartRate
2024-01-15,23:00,07:00,8,2,4,1.5,1,85,62`

      const result = await parseCSV(csvText)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        date: '2024-01-15',
        bedTime: '23:00',
        wakeTime: '07:00',
        sleepDuration: 8,
        deepSleep: 2,
        lightSleep: 4,
        remSleep: 1.5,
        awakeCount: 1,
        sleepScore: 85,
        heartRate: 62
      })
    })

    it('should parse CSV with Chinese headers', async () => {
      const csvText = `日期,入睡时间,醒来时间,睡眠时长,深睡,浅睡,REM,清醒次数,睡眠评分,心率
2024-01-15,23:00,07:00,8,2,4,1.5,1,85,62`

      const result = await parseCSV(csvText)

      expect(result).toHaveLength(1)
      expect(result[0].date).toBe('2024-01-15')
      expect(result[0].sleepDuration).toBe(8)
    })

    it('should handle missing optional fields', async () => {
      const csvText = `date,bedTime,wakeTime,sleepDuration
2024-01-15,23:00,07:00,8`

      const result = await parseCSV(csvText)

      expect(result).toHaveLength(1)
      expect(result[0].deepSleep).toBeUndefined()
      expect(result[0].heartRate).toBeUndefined()
    })

    it('should parse multiple rows', async () => {
      const csvText = `date,bedTime,wakeTime,sleepDuration
2024-01-15,23:00,07:00,8
2024-01-16,00:00,08:00,8
2024-01-17,22:30,06:30,8`

      const result = await parseCSV(csvText)

      expect(result).toHaveLength(3)
      expect(result[0].date).toBe('2024-01-15')
      expect(result[1].date).toBe('2024-01-16')
      expect(result[2].date).toBe('2024-01-17')
    })

    it('should handle empty CSV', async () => {
      const csvText = `date,bedTime,wakeTime,sleepDuration`

      const result = await parseCSV(csvText)

      expect(result).toHaveLength(0)
    })

    it('should handle invalid numbers gracefully', async () => {
      const csvText = `date,bedTime,wakeTime,sleepDuration,deepSleep
2024-01-15,23:00,07:00,invalid,also-invalid`

      const result = await parseCSV(csvText)

      expect(result).toHaveLength(1)
      expect(result[0].sleepDuration).toBeUndefined()
      expect(result[0].deepSleep).toBeUndefined()
    })
  })
})
