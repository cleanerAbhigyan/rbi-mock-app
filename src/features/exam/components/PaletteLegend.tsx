import type { QuestionStatus } from '../../../types/exam';
import { paletteStates } from './palette-states';

export function PaletteLegend({
  counts,
}: {
  counts?: Record<QuestionStatus, number>;
}) {
  return (
    <ul
      className="palette-legend"
      aria-label={
        counts ? 'Active section status counts' : 'Question status legend'
      }
    >
      {(
        Object.entries(paletteStates) as [
          QuestionStatus,
          { label: string; symbol: string },
        ][]
      ).map(([status, { label, symbol }]) => (
        <li key={status}>
          <span
            className={`palette-symbol status-${status}`}
            aria-hidden="true"
          >
            {symbol}
          </span>
          <span>
            {label}
            {counts ? <strong> {counts[status]}</strong> : null}
          </span>
        </li>
      ))}
    </ul>
  );
}
