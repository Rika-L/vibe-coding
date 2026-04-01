import { describe, it, expect } from 'vitest'
import { loginSchema, registerSchema, sleepRecordSchema } from '../../../src/lib/validations/auth'

describe('loginSchema', () => {
  it('should validate valid login data', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: 'password123'
    })
    expect(result.success).toBe(true)
  })

  it('should reject invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'invalid-email',
      password: 'password123'
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('请输入有效的邮箱地址')
    }
  })

  it('should reject empty password', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: ''
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('请输入密码')
    }
  })
})

describe('registerSchema', () => {
  it('should validate valid register data', () => {
    const result = registerSchema.safeParse({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    })
    expect(result.success).toBe(true)
  })

  it('should validate register data without name', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'password123'
    })
    expect(result.success).toBe(true)
  })

  it('should reject password shorter than 6 characters', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: '12345'
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('密码至少 6 个字符')
    }
  })

  it('should reject password longer than 100 characters', () => {
    const result = registerSchema.safeParse({
      email: 'test@example.com',
      password: 'a'.repeat(101)
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('密码最多 100 个字符')
    }
  })

  it('should reject name longer than 50 characters', () => {
    const result = registerSchema.safeParse({
      name: 'a'.repeat(51),
      email: 'test@example.com',
      password: 'password123'
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('姓名最多 50 个字符')
    }
  })

  it('should reject invalid email', () => {
    const result = registerSchema.safeParse({
      email: 'invalid-email',
      password: 'password123'
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('请输入有效的邮箱地址')
    }
  })
})

describe('sleepRecordSchema', () => {
  it('should validate valid sleep record with all fields', () => {
    const result = sleepRecordSchema.safeParse({
      date: '2024-01-15',
      sleepDuration: 7.5,
      bedTime: '23:00',
      wakeTime: '06:30',
      deepSleep: 2,
      lightSleep: 3,
      remSleep: 1.5,
      awakeCount: 2,
      sleepScore: 85,
      heartRate: 65
    })
    expect(result.success).toBe(true)
  })

  it('should validate valid sleep record with minimal fields', () => {
    const result = sleepRecordSchema.safeParse({
      date: '2024-01-15',
      sleepDuration: 7.5
    })
    expect(result.success).toBe(true)
  })

  it('should reject invalid date format', () => {
    const result = sleepRecordSchema.safeParse({
      date: '2024/01/15',
      sleepDuration: 7.5
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('请选择有效日期')
    }
  })

  it('should reject sleep duration over 24 hours', () => {
    const result = sleepRecordSchema.safeParse({
      date: '2024-01-15',
      sleepDuration: 25
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('睡眠时长不能超过 24 小时')
    }
  })

  it('should reject negative sleep duration', () => {
    const result = sleepRecordSchema.safeParse({
      date: '2024-01-15',
      sleepDuration: -1
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('睡眠时长必须大于 0')
    }
  })

  it('should reject zero sleep duration', () => {
    const result = sleepRecordSchema.safeParse({
      date: '2024-01-15',
      sleepDuration: 0
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('睡眠时长必须大于 0')
    }
  })

  it('should reject sleep score over 100', () => {
    const result = sleepRecordSchema.safeParse({
      date: '2024-01-15',
      sleepDuration: 7,
      sleepScore: 101
    })
    expect(result.success).toBe(false)
  })

  it('should reject sleep score below 0', () => {
    const result = sleepRecordSchema.safeParse({
      date: '2024-01-15',
      sleepDuration: 7,
      sleepScore: -1
    })
    expect(result.success).toBe(false)
  })

  it('should reject heart rate below 30', () => {
    const result = sleepRecordSchema.safeParse({
      date: '2024-01-15',
      sleepDuration: 7,
      heartRate: 20
    })
    expect(result.success).toBe(false)
  })

  it('should reject heart rate above 200', () => {
    const result = sleepRecordSchema.safeParse({
      date: '2024-01-15',
      sleepDuration: 7,
      heartRate: 250
    })
    expect(result.success).toBe(false)
  })

  it('should reject invalid bedTime format', () => {
    const result = sleepRecordSchema.safeParse({
      date: '2024-01-15',
      sleepDuration: 7,
      bedTime: '11:00 PM'
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('请输入有效时间')
    }
  })

  it('should reject invalid wakeTime format', () => {
    const result = sleepRecordSchema.safeParse({
      date: '2024-01-15',
      sleepDuration: 7,
      wakeTime: '6:30 am'
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('请输入有效时间')
    }
  })

  it('should accept empty string for bedTime', () => {
    const result = sleepRecordSchema.safeParse({
      date: '2024-01-15',
      sleepDuration: 7,
      bedTime: ''
    })
    expect(result.success).toBe(true)
  })

  it('should reject negative awakeCount', () => {
    const result = sleepRecordSchema.safeParse({
      date: '2024-01-15',
      sleepDuration: 7,
      awakeCount: -1
    })
    expect(result.success).toBe(false)
  })

  it('should reject non-integer awakeCount', () => {
    const result = sleepRecordSchema.safeParse({
      date: '2024-01-15',
      sleepDuration: 7,
      awakeCount: 2.5
    })
    expect(result.success).toBe(false)
  })

  it('should accept null for optional fields', () => {
    const result = sleepRecordSchema.safeParse({
      date: '2024-01-15',
      sleepDuration: 7,
      deepSleep: null,
      sleepScore: null,
      heartRate: null
    })
    expect(result.success).toBe(true)
  })
})
