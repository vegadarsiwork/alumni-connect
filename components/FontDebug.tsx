import React from 'react';

export default function FontDebug() {
  return (
    <div className="p-4 border border-dashed border-red-500 mt-8">
      <h2 className="text-xl font-bold mb-4 text-red-500">Font Debugging Component</h2>
      <p className="font-dot text-2xl mb-2">This should be DotGothic16 (font-dot)</p>
      <p className="font-mono text-2xl">This should be Geist Mono (font-mono)</p>
      <p className="text-sm mt-4">If these fonts don&apos;t look right, there&apos;s a loading or application issue.</p>
    </div>
  );
}
