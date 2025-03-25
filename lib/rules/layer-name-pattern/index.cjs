// NOTICE: This file is generated by Rollup. To modify it,
// please instead edit the ESM counterpart and rebuild with Rollup (npm run build).
'use strict';

const valueParser = require('postcss-value-parser');
const regexes = require('../../utils/regexes.cjs');
const validateTypes = require('../../utils/validateTypes.cjs');
const nodeFieldIndices = require('../../utils/nodeFieldIndices.cjs');
const report = require('../../utils/report.cjs');
const ruleMessages = require('../../utils/ruleMessages.cjs');
const validateOptions = require('../../utils/validateOptions.cjs');

const ruleName = 'layer-name-pattern';

const messages = ruleMessages(ruleName, {
	expected: (name, pattern) => `Expected "${name}" to match pattern "${pattern}"`,
});

const meta = {
	url: 'https://stylelint.io/user-guide/rules/layer-name-pattern',
};

/** @type {import('stylelint').CoreRules[ruleName]} */
const rule = (primary) => {
	return (root, result) => {
		const validOptions = validateOptions(result, ruleName, {
			actual: primary,
			possible: [validateTypes.isRegExp, validateTypes.isString],
		});

		if (!validOptions) return;

		const pattern = validateTypes.isString(primary) ? new RegExp(primary) : primary;

		root.walkAtRules(regexes.atRuleRegexes.layerName, (atRule) => {
			const { params } = atRule;

			if (!params) return;

			const parsedParams = valueParser(params);

			parsedParams.walk((node) => {
				check(node.type, node.value, node.sourceIndex, atRule);
			});
		});

		root.walkAtRules(regexes.atRuleRegexes.importName, (atRule) => {
			const { params } = atRule;

			if (!regexes.functionRegexes.layer.test(params)) return;

			const parsedParams = valueParser(atRule.params);

			parsedParams.walk((node) => {
				if (node.type !== 'function' || node.value.toLowerCase() !== 'layer') return;

				for (const child of node.nodes) {
					check(child.type, child.value, child.sourceIndex, atRule);
				}
			});
		});

		/**
		 * @param {string} type
		 * @param {string} value
		 * @param {number} sourceIndex
		 * @param {import('postcss').AtRule} atRule
		 */
		function check(type, value, sourceIndex, atRule) {
			if (type !== 'word') return;

			if (pattern.test(value)) return;

			const index = nodeFieldIndices.atRuleParamIndex(atRule) + sourceIndex;
			const endIndex = index + value.length;

			report({
				message: messages.expected(value, primary),
				node: atRule,
				index,
				endIndex,
				ruleName,
				result,
			});
		}
	};
};

rule.ruleName = ruleName;
rule.messages = messages;
rule.meta = meta;

module.exports = rule;
