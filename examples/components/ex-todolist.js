{
class TramLite{static version="4.2.0";static installed=!1;static makeComponentClass(t,...e){var a=document.createElement("template"),o=e.map(t=>`tl:${t}:`);a.innerHTML=String.raw({raw:t},...o);const r=a.content.firstElementChild,i={};[...r.attributes].forEach(t=>{i[t.name]=t.value}),r.querySelectorAll("script[tl-effect]:not([tl-hold])").forEach(t=>{t.setAttribute("tl-hold","component-mount")});class n extends HTMLElement{static tramLiteVersion="4.2.0";static tagName=r.tagName.toLowerCase();static get observedAttributes(){return e}constructor(){super(),this.templateValuesAttrNodes=[],this.templateValuesTextNodes=[];var t=this.attachShadow({mode:"open"});t.append(...r.cloneNode(!0).childNodes),ComponentDefinition.getTextNodesWithTramLiteValues(t).forEach(t=>{this.templateValuesTextNodes.push({textNode:t,originalTemplate:t.textContent})}),ComponentDefinition.getElementsWithTramLiteValuesInAttributes(t).forEach(e=>{[...e.attributes].forEach(t=>{t.value.match(/tl:(.+?):/)&&this.templateValuesAttrNodes.push({attrNode:t,element:e,originalTemplate:t.value})})})}connectedCallback(){var t=Object.keys(i);[...e,...t].forEach(t=>{null===this.getAttribute(t)&&this.setAttribute(t,i[t]||"")}),this.attributeChangedCallback(),this.shadowRoot.querySelectorAll('script[tl-hold="component-mount"]').forEach(t=>{t.removeAttribute("tl-hold")})}attributeChangedCallback(t,e,a){this.updateTextNodeTemplates(),this.updateAttrNodeTemplates()}getUpdatedTemplate(t){let a=t;return e.forEach(t=>{var e=this.getAttribute(t)||i[t]||"";a=a.replaceAll(`tl:${t}:`,e)}),a}updateTextNodeTemplates(){this.templateValuesTextNodes.forEach(({textNode:t,originalTemplate:e})=>{t.textContent=this.getUpdatedTemplate(e)})}updateAttrNodeTemplates(){this.templateValuesAttrNodes.forEach(({attrNode:t,element:e,originalTemplate:a})=>{t.value=this.getUpdatedTemplate(a),["value","checked","selected"].includes(t.name)&&(e[t.name]=this.getUpdatedTemplate(a))})}}return n}static define(t,...e){return t=TramLite.makeComponentClass(t,...e),customElements.define(t.tagName,t),t}static updateRootAttr(t,e,a="value"){var o=e.target.getRootNode().host;e.target[a]?o.setAttribute(t,e.target[a]):o.removeAttribute(t)}static addAttributeListener(e,t,a){new MutationObserver(t=>{t.forEach(t=>{t.oldValue!==e.getAttribute(t.attributeName)&&a(t)})}).observe(e,{attributes:!0,attributeFilter:t,attributeOldValue:!0})}static appendShadowRootProcessor(e,a,t=ShadowRoot.prototype){const o=t.append;t.append=function(...t){o.call(this,...t),this.querySelectorAll(e).forEach(t=>{t.getRootNode().host&&a.connect(t)})}}}class ComponentDefinition{static templateVariableRegex=/tl:(.+?):/;static nodeHasTramLiteAttr=t=>[...t.attributes].some(t=>t.value.match(ComponentDefinition.templateVariableRegex))?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP;static nodeHasTextElementWithTramLiteAttr=t=>t.textContent.match(ComponentDefinition.templateVariableRegex)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;static buildTreeWalkerTramLiteMatcher(t,e,a){for(var o,r=[],i=document.createTreeWalker(t,e,{acceptNode:a});o=i.nextNode();)r.push(o);return r}static getElementsWithTramLiteValuesInAttributes(t){return ComponentDefinition.buildTreeWalkerTramLiteMatcher(t,NodeFilter.SHOW_ELEMENT,ComponentDefinition.nodeHasTramLiteAttr)}static getTextNodesWithTramLiteValues(t){return ComponentDefinition.buildTreeWalkerTramLiteMatcher(t,NodeFilter.SHOW_TEXT,ComponentDefinition.nodeHasTextElementWithTramLiteAttr)}static processTemplateDefinition(t){[...t.content.children].forEach(t=>{var t=t.outerHTML,[t,e]=ComponentDefinition.extractTemplateVariables(t);TramLite.define(t,...e)})}static extractTemplateVariables(t){return[(t=t.split(/\$\{\'(.*?)\'\}/)).filter((t,e)=>e%2==0),t.filter((t,e)=>e%2!=0)]}static setupMutationObserverForTemplates(t=document){new MutationObserver(t=>{t.forEach(t=>{t.addedNodes.forEach(t=>{t.previousSibling?.matches?.("[tl-definition]")&&ComponentDefinition.processTemplateDefinition(t.previousSibling)})})}).observe(document,{subtree:!0,childList:!0})}}class ComponentEffect{static processScriptTag(t){var e;t.hasAttribute("tl-hold")||(e=t.getRootNode().host,t=t.innerHTML,Function("document","window",t).bind(e)(e.shadowRoot,window))}static connect(t){var e,a=t.getRootNode().host;ComponentEffect.processScriptTag(t),t.hasAttribute("tl-dependencies")&&!0!==t.hasSetupListener&&(e=t.getAttribute("tl-dependencies").split(" "),TramLite.addAttributeListener(a,e,()=>{ComponentEffect.processScriptTag(t)}),t.hasSetupListener=!0),TramLite.addAttributeListener(t,["tl-hold"],()=>{ComponentEffect.processScriptTag(t)})}}class ControlledInput{static connect(e){var t=(e.getAttribute("tl-trigger")||"change").split(" ");const a=e.getAttribute("tl-hostattr")||"value",o=e.getAttribute("tl-targetattr")||"value",r=e.getRootNode().host;e[o]=r.getAttribute(a),TramLite.addAttributeListener(r,[a],()=>{e[o]=r.getAttribute(a)}),t.forEach(t=>{e.addEventListener(t,t=>{TramLite.updateRootAttr(a,t,o)})})}}class ImportComponent{static processDefinitionTemplate(t){var e=document.createElement("template");e.innerHTML=t,[...t=e.content.children].forEach(t=>{ImportComponent.importNewComponent(t.outerHTML)})}static importNewComponent(t){var[t,e]=ComponentDefinition.extractTemplateVariables(t);const a=(t=TramLite.makeComponentClass(t,...e)).prototype.attachShadow;t.prototype.attachShadow=function(...t){return t=a.call(this,...t),TramLite.appendShadowRootProcessor("[tl-controlled]",ControlledInput,t),TramLite.appendShadowRootProcessor("[tl-effect]",ComponentEffect,t),t},customElements.define(t.tagName,t)}}

{
	const componentTemplate = `<ex-todoitem>
	<label style="display: block">
		<input type="checkbox" tl-controlled tl-hostattr="checked" tl-targetattr="checked" />
		<slot></slot>
	</label>
	<script tl-effect tl-dependencies="checked">
		const todoItemList = this.getRootNode().host;

		// query all list items to determine new completed and total
		const todoItems = todoItemList.shadowRoot.querySelectorAll('ex-todoitem');
		todoItemList.setAttribute('total', todoItems.length);
		const completedItems = todoItemList.shadowRoot.querySelectorAll('ex-todoitem[checked]');
		todoItemList.setAttribute('completed', completedItems.length);
	</script>
</ex-todoitem>

<ex-todolist completed="0" total="0">
	<style>
		todo-section {
			padding-inline-start: 5px;
			margex-block-start: 5px;
		}
	</style>
	<span>To Do List (\${'completed'}/\${'total'})</span>
	<form>
		<input name="input" placeholder="New Item" autofill="false" />
	</form>
	<todo-section></todo-section>
	<script tl-effect>
		const todoList = this;

		function addNewTodoItem(todoText) {
			const list = todoList.shadowRoot.querySelector('todo-section');
			const newItem = this.document.createElement('ex-todoitem');
			newItem.innerText = todoText;
			list.appendChild(newItem);
		}

		function submitNewTodoItem(event) {
			event.preventDefault();
			addNewTodoItem(event.target.input.value);
			event.target.reset();
		}
		todoList.shadowRoot.querySelector('form').addEventListener('submit', submitNewTodoItem);

		addNewTodoItem('Example Initial Item');
		addNewTodoItem('Learning Tram-Lite');
	</script>
</ex-todolist>
`;
	ImportComponent.processDefinitionTemplate(componentTemplate);
}

}