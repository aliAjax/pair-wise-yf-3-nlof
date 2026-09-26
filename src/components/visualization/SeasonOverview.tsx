import { useMemo } from 'react';
import type { SmellMemory } from '../../utils/constants';
import { SEASONS, getSeasonInfo } from '../../utils/constants';
import { getMemorySeasons, getSeasonOverviewByYear } from '../../utils/helpers';

interface Props {
  memories: SmellMemory[];
}

export default function SeasonOverview({ memories }: Props) {
  const groups = useMemo(() => getSeasonOverviewByYear(memories), [memories]);
  const yearGroups = groups.filter((g) => g.year !== null);
  const missingGroup = groups.find((g) => g.year === null) ?? null;
  const maxCount = Math.max(
    1,
    ...groups.flatMap((g) => SEASONS.map((s) => g.counts[s.value])),
  );

  const renderCells = (counts: Record<string, number>) =>
    SEASONS.map((s) => {
      const count = counts[s.value] ?? 0;
      const alpha = count === 0 ? 0 : 0.1 + 0.45 * (count / maxCount);
      return (
        <div
          key={s.value}
          title={`${s.label}季 · ${count} 段`}
          className="flex items-center justify-center gap-1 rounded-lg py-1.5 text-sm font-semibold transition-colors"
          style={{
            backgroundColor: `rgba(139, 90, 43, ${alpha})`,
            color: count === 0 ? '#3A2F2540' : '#5C3A1D',
          }}
        >
          {count === 0 ? '·' : count}
        </div>
      );
    });

  return (
    <div className="bg-paper-50/80 backdrop-blur rounded-2xl border border-paper-300 p-5 shadow-paper md:col-span-2">
      <div className="flex flex-wrap items-baseline justify-between gap-1 mb-4">
        <h4 className="font-hand text-xl text-ochre-600">四季概览</h4>
        <span className="text-xs text-ink-700/60">
          按封存年份展开 · 跨季回忆计入每个对应季节，总量仍只算一次
        </span>
      </div>

      <div className="grid grid-cols-[3.5rem_repeat(4,1fr)_3rem] gap-1.5 items-center text-center">
        <span className="text-[11px] text-ink-700/50 text-left">年份</span>
        {SEASONS.map((s) => (
          <span key={s.value} className="text-[11px] text-ink-700/70">
            {s.emoji} {s.label}
          </span>
        ))}
        <span className="text-[11px] text-ink-700/50">总量</span>

        {yearGroups.map((g) => (
          <div key={g.year} className="contents">
            <span className="font-serif font-semibold text-ink-800 text-left">{g.year}</span>
            {renderCells(g.counts)}
            <span
              className="text-sm font-bold text-ochre-600"
              title={`${g.year} 年共封存 ${g.total} 段气味`}
            >
              {g.total}
            </span>
          </div>
        ))}
      </div>

      {missingGroup && (
        <div className="mt-4 pt-3 border-t border-dashed border-paper-400">
          <div className="grid grid-cols-[3.5rem_repeat(4,1fr)_3rem] gap-1.5 items-center text-center">
            <span className="text-[11px] text-ink-700/60 text-left leading-tight">年份缺失</span>
            {renderCells(missingGroup.counts)}
            <span className="text-sm font-bold text-ochre-600">{missingGroup.total}</span>
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-ink-700/50">旧记录单独列出：</span>
            {missingGroup.records.map((r) => (
              <span key={r.id} className="scent-tag bg-paper-200/80 text-ink-700 border border-paper-300">
                {getMemorySeasons(r).map((s) => getSeasonInfo(s).emoji).join('')}
                {r.location}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
