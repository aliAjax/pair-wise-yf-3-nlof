import { useMemo } from 'react';
import type { SmellMemory } from '../../utils/constants';
import { SEASONS } from '../../utils/constants';
import { getSeasonYearOverview } from '../../utils/helpers';

interface Props {
  memories: SmellMemory[];
}

export default function SeasonOverview({ memories }: Props) {
  const groups = useMemo(() => getSeasonYearOverview(memories), [memories]);
  const maxCount = Math.max(
    1,
    ...groups.flatMap((g) => SEASONS.map((s) => g.counts[s.value])),
  );

  return (
    <div className="bg-paper-50/80 backdrop-blur rounded-2xl border border-paper-300 p-5 shadow-paper md:col-span-2">
      <div className="flex items-center justify-between mb-1">
        <h4 className="font-hand text-xl text-ochre-600">四季概览</h4>
        <span className="text-xs text-ink-700/60">按封存年份展开</span>
      </div>
      <p className="text-[11px] text-ink-700/50 mb-4">
        跨季回忆在每个季节各出现一次，年份总数仍只计一段
      </p>

      <div className="space-y-3">
        {groups.map((g) => {
          const unknown = g.year === null;
          return (
            <div
              key={g.year ?? 'unknown'}
              className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 rounded-xl px-4 py-3 ${
                unknown
                  ? 'border-2 border-dashed border-paper-400 bg-paper-100/40'
                  : 'border border-paper-200 bg-paper-100/60'
              }`}
            >
              <div className="sm:w-32 shrink-0 flex sm:flex-col items-baseline sm:items-start gap-2 sm:gap-0">
                <span className="font-serif text-2xl font-bold text-ink-800 leading-none">
                  {unknown ? '年份未知' : g.year}
                </span>
                <span className="text-[11px] text-ink-700/55 sm:mt-1">
                  {unknown ? '旧记录缺少封存时间 · ' : ''}共 {g.total} 段
                </span>
              </div>

              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2">
                {SEASONS.map((s) => {
                  const count = g.counts[s.value];
                  return (
                    <div
                      key={s.value}
                      className="rounded-lg bg-paper-50/80 border border-paper-200/80 px-3 py-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-ink-700/70">
                          {s.emoji} {s.label}
                        </span>
                        <span
                          className="font-serif text-lg font-bold leading-none"
                          style={{ color: count > 0 ? s.color : '#CBB993' }}
                        >
                          {count}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1 rounded-full bg-paper-200 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${(count / maxCount) * 100}%`,
                            backgroundColor: s.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
