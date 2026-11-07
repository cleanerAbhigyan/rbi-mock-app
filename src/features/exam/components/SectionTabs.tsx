import { useRef } from 'react';
import type { ExamSection } from '../../../types/exam';

export function SectionTabs({
  sections,
  activeSectionId,
  onSelect,
}: {
  sections: readonly ExamSection[];
  activeSectionId: string;
  onSelect: (section: ExamSection) => void;
}) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  return (
    <div className="section-tabs" role="tablist" aria-label="Phase I sections">
      {sections.map((section, index) => (
        <button
          key={section.id}
          type="button"
          role="tab"
          id={`tab-${section.id}`}
          aria-controls={`panel-${section.id}`}
          aria-selected={section.id === activeSectionId}
          tabIndex={section.id === activeSectionId ? 0 : -1}
          ref={(node) => {
            buttons.current[index] = node;
          }}
          onClick={() => onSelect(section)}
          onKeyDown={(event) => {
            let nextIndex: number;
            switch (event.key) {
              case 'ArrowRight':
                nextIndex = (index + 1) % sections.length;
                break;
              case 'ArrowLeft':
                nextIndex = (index + sections.length - 1) % sections.length;
                break;
              case 'Home':
                nextIndex = 0;
                break;
              case 'End':
                nextIndex = sections.length - 1;
                break;
              default:
                return;
            }
            event.preventDefault();
            const target = sections[nextIndex];
            if (target) {
              onSelect(target);
              buttons.current[nextIndex]?.focus();
            }
          }}
        >
          {section.title}
        </button>
      ))}
    </div>
  );
}
