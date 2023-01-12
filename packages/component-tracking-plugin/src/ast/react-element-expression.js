
const estraverse = require("estraverse");

/**
 * AST Expression 이 React Element를 생성하는 함수 호출인지 확인해주는 Util 함수 
 * @param {*} expression 검증할 AST Expression 객체
 * @returns {boolean} 
 */
const checkJSXCallExpression = (expression) => expression.type === "CallExpression"
    && expression.callee?.type === "Identifier"
    && expression.callee.name === "_jsx";

/**
 * AST 분석을 통해 React Element를 생성하는 함수 CallExpression을 모두 찾아서 호출 정보 반환
 * @param {*} ast 
 * @returns 
 */
function getReactComponentsFromAST(ast) {
    const result = [];

    estraverse.traverse(ast, {
        enter: function (node, parent) {
            if (!checkJSXCallExpression(node)) return;

            const jsxCallExpression = node;
            const args = jsxCallExpression.arguments;
            if (args === undefined || args.length === 0) return;

            const elementType = args[0];
            const propsObjExpression = args[1];

            // when type is "Identifier", React Component 
            if (elementType.type !== "Identifier") return;

            const componentName = elementType.name;
            const componentProps = {};

            if (args.length > 1) {
                for (const property of propsObjExpression.properties) {
                    const key = property.key.name;
                    let value = undefined;

                    if (property.value.type === "Literal") {
                        value = property.value.value;
                    } else if (property.value.type === "Identifier") {
                        value = property.value.name; // TODO: 변수로 사용될 경우. 변수 이름만 처리할 수 있음.
                    }
                    componentProps[key] = value;
                }
            }

            result.push({
                name: componentName,
                props: componentProps
            })
        }
    })

    return result;
}

module.exports = {
    getReactComponentsFromAST
}