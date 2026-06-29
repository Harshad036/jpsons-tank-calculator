import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

let content = execSync('git show HEAD:src/pages/CalculatorPage.tsx', {
  encoding: 'utf8',
  cwd: import.meta.dirname + '/..',
});

content = content
  .replace(
    "import { Link, Navigate, useParams } from 'react-router-dom';",
    "import { Link } from 'react-router-dom';",
  )
  .replace(
    "import { getItemById } from '../data/items';",
    "import type { CalculatorItem } from '../data/items';",
  )
  .replace(
    'export default function CalculatorPage() {\n  const { itemId } = useParams<{ itemId: string }>();\n  const item = itemId ? getItemById(itemId) : undefined;',
    'interface Props {\n  item: CalculatorItem;\n}\n\nexport default function MixingCalculatorPage({ item }: Props) {',
  )
  .replace(
    '\n  if (!item) {\n    return <Navigate to="/" replace />;\n  }\n\n',
    '\n',
  );

writeFileSync(new URL('../src/pages/MixingCalculatorPage.tsx', import.meta.url), content);
