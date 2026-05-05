import {
  addDurationToDate,
  parseDurationToMs,
} from '../../../../src/auth/utils/duration.util';

describe('duration.util', () => {
  describe('parseDurationToMs', () => {
    it.each([
      ['15m', 15 * 60_000],
      ['2h', 2 * 3_600_000],
      ['7d', 7 * 86_400_000],
      ['45s', 45_000],
      [' 5M ', 5 * 60_000],
    ] as const)('parses %s', (input, expected) => {
      expect(parseDurationToMs(input as `${number}m`)).toBe(expected);
    });

    it('throws for unsupported formats', () => {
      expect(() => parseDurationToMs('15' as never)).toThrow(
        'Unsupported duration format: 15',
      );
    });
  });

  describe('addDurationToDate', () => {
    it('adds the parsed duration to the provided date', () => {
      const baseDate = new Date('2026-03-24T10:00:00.000Z');

      expect(addDurationToDate('15m', baseDate).toISOString()).toBe(
        '2026-03-24T10:15:00.000Z',
      );
    });

    it('uses the current date when no base date is provided', () => {
      const RealDate = Date;
      const fixedNow = new RealDate('2026-03-24T10:00:00.000Z');

      class MockDate extends RealDate {
        constructor(...args: ConstructorParameters<DateConstructor>) {
          if (args.length === 0) {
            super(fixedNow.toISOString());
            return;
          }

          super(...args);
        }

        static now() {
          return fixedNow.getTime();
        }
      }

      // @ts-expect-error test-only replacement
      global.Date = MockDate;
      expect(addDurationToDate('1h').toISOString()).toBe(
        '2026-03-24T11:00:00.000Z',
      );
      global.Date = RealDate;
    });
  });
});
