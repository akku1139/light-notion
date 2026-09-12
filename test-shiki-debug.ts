// Test file to debug Shiki integration
// This file simulates the code block rendering process

import { createHighlighter } from 'shiki';

async function testShikiIntegration() {
  console.log('=== Testing Shiki Integration ===\n');

  // Test 1: Create highlighter
  console.log('1. Creating highlighter...');
  const highlighter = await createHighlighter({
    themes: ['github-dark', 'github-light'],
    langs: ['javascript', 'typescript', 'python'],
  });
  console.log('✓ Highlighter created');
  console.log('Loaded languages:', highlighter.getLoadedLanguages());
  console.log('Loaded themes:', highlighter.getLoadedThemes());

  // Test 2: Test code highlighting
  console.log('\n2. Testing code highlighting...');
  const testCode = 'const hello = "world";';
  const html = highlighter.codeToHtml(testCode, {
    lang: 'javascript',
    theme: 'github-dark',
  });
  console.log('✓ Code highlighted');
  console.log('Generated HTML:', html);

  // Test 3: Test className parsing
  console.log('\n3. Testing className parsing...');
  const testCases = [
    'language-javascript',
    'language-python',
    'language-typescript',
    'language-unknown',
    '',
  ];

  testCases.forEach(className => {
    const match = /language-(\w+)/.exec(className || '');
    const lang = match ? match[1] : '';
    console.log(`className: "${className}" → lang: "${lang}"`);
  });

  // Test 4: Test inline style removal
  console.log('\n4. Testing inline style removal...');
  const htmlWithStyle = '<pre style="background-color: #ffffff; color: #24292e;"><code>test</code></pre>';
  const processedHtml = htmlWithStyle
    .replace(/style="[^"]*background-color:[^"]*"/g, '')
    .replace(/class="shiki[^"]*"/g, 'class="shiki-code"');
  console.log('Original:', htmlWithStyle);
  console.log('Processed:', processedHtml);

  console.log('\n=== Test Complete ===');
}

testShikiIntegration().catch(console.error);
