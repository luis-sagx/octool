import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputBox } from '../../ui/input-box/input-box';
interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  text: string;
}

@Component({
  selector: 'app-diff-checker',
  standalone: true,
  // Added InputBoxComponent and kept CommonModule for the @if/@for logic
  imports: [CommonModule, InputBox],
  templateUrl: './diff-checker.html',
})
export class DiffChecker {
  leftText = signal('');
  rightText = signal('');

  // The state and logic remain largely the same, making the transition smooth
  diffLines = signal<DiffLine[]>([]);

  addedCount = computed(
    () => this.diffLines().filter((l) => l.type === 'added').length,
  );
  removedCount = computed(
    () => this.diffLines().filter((l) => l.type === 'removed').length,
  );
  unchangedCount = computed(
    () => this.diffLines().filter((l) => l.type === 'unchanged').length,
  );
  hasDiff = computed(() => this.diffLines().length > 0);

  computeDiff() {
    const left = this.leftText().split('\n');
    const right = this.rightText().split('\n');

    const m = left.length,
      n = right.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] =
          left[i - 1] === right[j - 1]
            ? dp[i - 1][j - 1] + 1
            : Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }

    const result: DiffLine[] = [];
    let i = m,
      j = n;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && left[i - 1] === right[j - 1]) {
        result.unshift({ type: 'unchanged', text: left[i - 1] });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        result.unshift({ type: 'added', text: right[j - 1] });
        j--;
      } else {
        result.unshift({ type: 'removed', text: left[i - 1] });
        i--;
      }
    }
    this.diffLines.set(result);
  }

  clear() {
    this.leftText.set('');
    this.rightText.set('');
    this.diffLines.set([]);
  }
}
