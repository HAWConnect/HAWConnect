import { describe, expect, test } from 'bun:test'
import { parseClubRichText, safeClubUrl } from '../club-rich-text'

describe('club rich descriptions', () => {
	test('preserves formatting, entities, lists and image alt text without arbitrary attributes', () => {
		const result = parseClubRichText(
			'<h2>Hello &amp; welcome</h2><ol><li><strong>Join</strong> us</li></ol><img src="https://images.example/a.png" alt="Our team" width="99999" onerror="evil()">'
		)
		expect(result).toEqual([
			{
				type: 'element',
				tag: 'h2',
				children: [{ type: 'text', text: 'Hello & welcome' }]
			},
			{
				type: 'element',
				tag: 'ol',
				children: [
					{
						type: 'element',
						tag: 'li',
						children: [
							{
								type: 'element',
								tag: 'strong',
								children: [{ type: 'text', text: 'Join' }]
							},
							{ type: 'text', text: ' us' }
						]
					}
				]
			},
			{
				type: 'element',
				tag: 'img',
				children: [],
				url: 'https://images.example/a.png',
				alt: 'Our team'
			}
		])
	})
	test('discards dangerous subtrees, comments and unsafe image sources; unwraps unknown formatting', () => {
		const result = parseClubRichText(
			'<script>bad()</script><svg><text>bad</text></svg><style>bad</style><iframe>bad</iframe><!--bad--><div>Good<img src="data:image/svg+xml,bad"><a href="javascript:bad()" onclick="bad()">link</a></div>'
		)
		expect(result).toEqual([
			{ type: 'text', text: 'Good' },
			{ type: 'element', tag: 'a', children: [{ type: 'text', text: 'link' }] }
		])
	})
	test('handles malformed markup and encoded attributes without execution', () => {
		expect(
			parseClubRichText(
				'<p>Hi<br>there<p><a href="jav&#97;script:alert(1)">Click'
			)
		).toEqual([
			{
				type: 'element',
				tag: 'p',
				children: [
					{ type: 'text', text: 'Hi' },
					{ type: 'element', tag: 'br', children: [] },
					{ type: 'text', text: 'there' }
				]
			},
			{
				type: 'element',
				tag: 'p',
				children: [
					{
						type: 'element',
						tag: 'a',
						children: [{ type: 'text', text: 'Click' }]
					}
				]
			}
		])
	})
	test('only permits credential-free HTTPS images and HTTPS/mailto actions', () => {
		for (const url of [
			'http://example.com',
			'//example.com',
			'https://user:pass@example.com',
			'javascript:alert(1)',
			' https://example.com',
			'https:\n//example.com',
			'file:///tmp/a',
			'mailto:a@example.com?body=%0d%0aInjected'
		]) {
			expect(safeClubUrl(url)).toBeUndefined()
		}
		expect(safeClubUrl('mailto:club@example.com')).toBe(
			'mailto:club@example.com'
		)
		expect(safeClubUrl('mailto:club@example.com', true)).toBeUndefined()
		expect(safeClubUrl('https://example.com/team.png', true)).toBe(
			'https://example.com/team.png'
		)
	})
	test('empty and fully discarded rich content allows a plain-description fallback', () => {
		for (const html of [
			'',
			'<p> </p><br>',
			'<p><img src="http://unsafe.example/a.png"></p>',
			'<script>alert(1)</script>'
		])
			expect(parseClubRichText(html)).toEqual([])
		expect(
			parseClubRichText(
				'<a href="https://example.com"><img src="https://example.com/a.png"></a>'
			)
		).toHaveLength(1)
	})
	test('bounds oversized and deeply nested input', () => {
		expect(parseClubRichText('x'.repeat(100_001))).toEqual([])
		const nodes = parseClubRichText(
			`${'<strong>'.repeat(1000)}hidden${'</strong>'.repeat(1000)}Visible`
		)
		expect(JSON.stringify(nodes)).not.toContain('hidden')
		expect(JSON.stringify(nodes)).toContain('Visible')
	})
})

test('legal text rendering can disable images without removing formatting or safe links', () => {
	const html =
		'<h2>Privacy</h2><p><strong>Important</strong> <a href="mailto:privacy@example.org">Contact</a><img src="https://example.org/tracker.png" alt="Hidden"></p>'
	const nodes = parseClubRichText(html, { allowImages: false })
	expect(JSON.stringify(nodes)).not.toContain('tracker.png')
	expect(JSON.stringify(nodes)).not.toContain('"img"')
	expect(JSON.stringify(nodes)).toContain('"strong"')
	expect(JSON.stringify(nodes)).toContain('mailto:privacy@example.org')
	expect(
		parseClubRichText('<p><img src="https://example.org/a.png"></p>', {
			allowImages: false
		})
	).toEqual([])
	expect(JSON.stringify(parseClubRichText(html))).toContain('tracker.png')
})
