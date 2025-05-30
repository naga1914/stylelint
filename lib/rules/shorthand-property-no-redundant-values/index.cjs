// NOTICE: This file is generated by Rollup. To modify it,
// please instead edit the ESM counterpart and rebuild with Rollup (npm run build).
'use strict';

const valueParser = require('postcss-value-parser');
const nodeFieldIndices = require('../../utils/nodeFieldIndices.cjs');
const isStandardSyntaxDeclaration = require('../../utils/isStandardSyntaxDeclaration.cjs');
const isStandardSyntaxProperty = require('../../utils/isStandardSyntaxProperty.cjs');
const isStandardSyntaxValue = require('../../utils/isStandardSyntaxValue.cjs');
const isVarFunction = require('../../utils/isVarFunction.cjs');
const report = require('../../utils/report.cjs');
const ruleMessages = require('../../utils/ruleMessages.cjs');
const validateOptions = require('../../utils/validateOptions.cjs');
const vendor = require('../../utils/vendor.cjs');
const typeGuards = require('../../utils/typeGuards.cjs');

const ruleName = 'shorthand-property-no-redundant-values';

const messages = ruleMessages(ruleName, {
	expected: (actual, expected) => `Expected "${actual}" to be "${expected}"`,
});

const meta = {
	url: 'https://stylelint.io/user-guide/rules/shorthand-property-no-redundant-values',
	fixable: true,
};

// prettier-ignore
const SUPPORTED_SHORTHANDS = new Set([
	'margin', 'margin-block', 'margin-inline',
	'padding', 'padding-block', 'padding-inline',
	'border-color', 'border-style', 'border-width',
	'border-radius',
	'border-block-color', 'border-block-style', 'border-block-width',
	'border-inline-color', 'border-inline-style', 'border-inline-width',
	'gap', 'grid-gap',
	'overflow',
	'overscroll-behavior',
	'scroll-margin', 'scroll-margin-block', 'scroll-margin-inline',
	'scroll-padding', 'scroll-padding-block', 'scroll-padding-inline',
	'inset', 'inset-block', 'inset-inline',
]);

/**
 * @param {string} property
 * @returns {boolean}
 */
function isSupportedShorthand(property) {
	return SUPPORTED_SHORTHANDS.has(property);
}

/**
 * @param {string} top
 * @param {string} right
 * @param {string} bottom
 * @param {string} left
 * @returns {string[]}
 */
function canCondense(top, right, bottom, left) {
	const lowerTop = top.toLowerCase();
	const lowerRight = right.toLowerCase();
	const lowerBottom = bottom && bottom.toLowerCase();
	const lowerLeft = left && left.toLowerCase();

	if (canCondenseToOneValue(lowerTop, lowerRight, lowerBottom, lowerLeft)) {
		return [top];
	}

	if (canCondenseToTwoValues(lowerTop, lowerRight, lowerBottom, lowerLeft)) {
		return [top, right];
	}

	if (canCondenseToThreeValues(lowerTop, lowerRight, lowerBottom, lowerLeft)) {
		return [top, right, bottom];
	}

	return [top, right, bottom, left];
}

/**
 * @param {string} top
 * @param {string} right
 * @param {string} bottom
 * @param {string} left
 * @returns {boolean}
 */
function canCondenseToOneValue(top, right, bottom, left) {
	if (top !== right) {
		return false;
	}

	return (top === bottom && (bottom === left || !left)) || (!bottom && !left);
}

/**
 * @param {string} top
 * @param {string} right
 * @param {string} bottom
 * @param {string} left
 * @returns {boolean}
 */
function canCondenseToTwoValues(top, right, bottom, left) {
	return (top === bottom && right === left) || (top === bottom && !left && top !== right);
}

/**
 * @param {string} _top
 * @param {string} right
 * @param {string} _bottom
 * @param {string} left
 * @returns {boolean}
 */
function canCondenseToThreeValues(_top, right, _bottom, left) {
	return right === left;
}

/** @type {import('stylelint').CoreRules[ruleName]} */
const rule = (primary) => {
	return (root, result) => {
		const validOptions = validateOptions(result, ruleName, { actual: primary });

		if (!validOptions) {
			return;
		}

		root.walkDecls((decl) => {
			if (!isStandardSyntaxDeclaration(decl)) return;

			const { prop, value } = decl;

			if (!isStandardSyntaxProperty(prop)) return;

			if (!isStandardSyntaxValue(value)) return;

			const normalizedProp = vendor.unprefixed(prop.toLowerCase());

			if (!isSupportedShorthand(normalizedProp)) return;

			/** @type {string[]} */
			const valuesToShorthand = [];

			for (const valueNode of valueParser(value).nodes) {
				if (typeGuards.isValueDiv(valueNode)) {
					return;
				}

				// `var()` should be ignored. E.g.
				//
				//   --padding: 20px 5px;
				//   padding: 0 var(--padding) 0;
				//
				if (isVarFunction(valueNode)) {
					return;
				}

				if (typeGuards.isValueWord(valueNode) || typeGuards.isValueFunction(valueNode)) {
					valuesToShorthand.push(valueParser.stringify(valueNode));
				}
			}

			if (valuesToShorthand.length <= 1 || valuesToShorthand.length > 4) {
				return;
			}

			const [first = '', second = '', third = '', fourth = ''] = valuesToShorthand;
			const shortestForm = canCondense(first, second, third, fourth);
			const shortestFormString = shortestForm.filter(Boolean).join(' ');
			const valuesFormString = valuesToShorthand.join(' ');

			if (shortestFormString.toLowerCase() === valuesFormString.toLowerCase()) {
				return;
			}

			const fix = () => {
				decl.value = decl.value.replace(value, shortestFormString);
			};

			const index = nodeFieldIndices.declarationValueIndex(decl);
			const endIndex = index + decl.value.length;

			report({
				message: messages.expected,
				messageArgs: [value, shortestFormString],
				node: decl,
				index,
				endIndex,
				result,
				ruleName,
				fix: {
					apply: fix,
					node: decl,
				},
			});
		});
	};
};

rule.ruleName = ruleName;
rule.messages = messages;
rule.meta = meta;

module.exports = rule;
