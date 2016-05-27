import test from 'ava';
import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import jsdom from 'jsdom';
import C from './';

test.beforeEach(() => {
	global.document = jsdom.jsdom();
	global.window = global.document.defaultView;
});

test.afterEach(() => {
	delete global.document;
	delete global.window;
});

test(t => {
	const result = createComponent(C);

	t.is(result.props.className, 'msts');
	t.is(result.type, 'div');
});

test('allow to add custom class name', t => {
	const props = {
		className: 'foo bar'
	};
	const result = createComponent(C, props);

	t.is(result.props.className, 'msts foo bar');
});

test('render childrens', t => {
	const props = {};
	const result = renderIntoDocument(props);

	const dec = getSideAvailable(result);
	t.is(dec.nodeName, 'DIV');
	t.is(dec.className, 'msts__side msts__side_available');

	const inc = getSideSelected(result);
	t.is(inc.nodeName, 'DIV');
	t.is(inc.className, 'msts__side msts__side_selected');
});

test('render list items', t => {
	const props = {
		options: [
			{label: 'Foo', value: 0, id: 0},
			{label: 'Bar', value: 1, id: 1}
		],
		value: [1]
	};
	const result = renderIntoDocument(props);

	const items = getElems(result, 'msts__list-item');
	t.is(items[0].innerHTML, 'Foo');
	t.is(items[1].innerHTML, 'Bar');
});

test('render controls', t => {
	const props = {
		showControls: true
	};
	const result = renderIntoDocument(props);

	const dec = getElem(result, 'msts__side_controls');
	t.is(dec.nodeName, 'DIV');
	t.is(dec.className, 'msts__side msts__side_controls');
});

test('dont render controls by default', t => {
	const props = {};
	const result = renderIntoDocument(props);

	t.throws(() => getElem(result, 'msts__side_controls'));
});

test('render filter', t => {
	const props = {
		searchable: true
	};
	const result = renderIntoDocument(props);

	const subheading = getElem(result, 'msts__subheading');
	t.is(subheading.nodeName, 'DIV');
	t.is(subheading.className, 'msts__subheading');
});

test('dont render filter by default', t => {
	const props = {};
	const result = renderIntoDocument(props);

	t.throws(() => getElem(result, 'msts__subheading'));
});

test('render filter clear', t => {
	const props = {
		searchable: true
	};
	const result = renderIntoDocument(props);

	const filters = getElems(result, 'msts__filter-input');
	t.is(getElems(result, 'msts__filter-clear').length, 0, 'dont render if filter is empty');

	filters[0].value = 'foo';
	ReactTestUtils.Simulate.change(filters[0]);
	t.is(getElems(result, 'msts__filter-clear').length, 1);

	filters[1].value = 'foo';
	ReactTestUtils.Simulate.change(filters[1]);
	t.is(getElems(result, 'msts__filter-clear').length, 2);

	const filterClear = getElems(result, 'msts__filter-clear');
	t.is(filterClear.length, 2);
	t.is(filterClear[0].nodeName, 'BUTTON');
	t.is(filterClear[0].className, 'msts__filter-clear');
});

test('dont render filter clear if `clearable` is false', t => {
	const props = {
		searchable: true,
		clearable: false
	};
	const result = renderIntoDocument(props);

	const filters = getElems(result, 'msts__filter-input');

	filters[0].value = 'foo';
	ReactTestUtils.Simulate.change(filters[0]);
	t.is(getElems(result, 'msts__filter-clear').length, 0);
});

test('disabled: disable controls', t => {
	const props = {
		showControls: true,
		disabled: true,
		options: [
			{label: 'Foo', value: 0, id: 0},
			{label: 'Bar', value: 1, id: 1}
		],
		value: [1]
	};
	const result = renderIntoDocument(props);

	const controls = getElems(result, 'msts__control');
	t.is(controls[0].disabled, true);
	t.is(controls[1].disabled, true);
});

test('disabled: disable filter', t => {
	const props = {
		searchable: true,
		disabled: true
	};
	const result = renderIntoDocument(props);

	const filters = getElems(result, 'msts__filter-input');
	t.is(filters[0].disabled, true);
	t.is(filters[1].disabled, true);

	filters[0].value = 'foo';
	ReactTestUtils.Simulate.change(filters[0]);
	filters[1].value = 'foo';
	ReactTestUtils.Simulate.change(filters[1]);

	const filterClears = getElems(result, 'msts__filter-clear');
	t.is(filterClears[0].disabled, true);
	t.is(filterClears[1].disabled, true);
});

test('disabled: disable component', t => {
	const result = createComponent(C, {disabled: true});

	t.is(result.props.className, 'msts msts_disabled');
});

test('disable: disable handle', t => {
	let isChanged = false;
	const props = {
		disabled: true,
		options: [
			{label: 'Foo', value: 0, id: 0}
		],
		onChange() {
			isChanged = true;
		}
	};
	const result = renderIntoDocument(props);

	const items = getElems(result, 'msts__list-item');
	ReactTestUtils.Simulate.click(items[0]);
	t.false(isChanged);
});

test('disable option', t => {
	let isChanged = false;
	const props = {
		options: [
			{label: 'Foo', value: 0, id: 0, disabled: true}
		],
		onChange() {
			isChanged = true;
		}
	};
	const result = renderIntoDocument(props);

	const items = getElems(result, 'msts__list-item');
	ReactTestUtils.Simulate.click(items[0]);
	t.false(isChanged);
	t.is(items[0].className, 'msts__list-item msts__list-item_disabled');
});

test('dont select disabled option by select all', t => {
	t.plan(1);

	const props = {
		showControls: true,
		options: [
			{label: 'Foo', value: 0, id: 0, disabled: true},
			{label: 'Bar', value: 1, id: 1}
		],
		onChange(value) {
			t.deepEqual(value, [1]);
		}
	};
	const result = renderIntoDocument(props);

	const selectAll = getElem(result, 'msts__control_select-all');
	ReactTestUtils.Simulate.click(selectAll);
});

test('prop clearFilterText', t => {
	const props = {
		searchable: true,
		clearFilterText: 'Foo'
	};
	const result = renderIntoDocument(props);

	const filters = getElems(result, 'msts__filter-input');

	filters[0].value = 'foo';
	ReactTestUtils.Simulate.change(filters[0]);
	filters[1].value = 'foo';
	ReactTestUtils.Simulate.change(filters[1]);

	const filterClear = getElems(result, 'msts__filter-clear');
	t.is(filterClear[0].title, 'Foo');
	t.is(filterClear[1].title, 'Foo');
});

test('prop selectAllText and deselectAllText', t => {
	const props = {
		showControls: true,
		selectAllText: 'Foo',
		deselectAllText: 'Bar'
	};
	const result = renderIntoDocument(props);

	const selectAll = getElem(result, 'msts__control_select-all');
	t.is(selectAll.title, 'Foo');

	const deselectAll = getElem(result, 'msts__control_deselect-all');
	t.is(deselectAll.title, 'Bar');
});

test('prop labelKey and valueKey', t => {
	let value = [];
	const props = {
		labelKey: 'foo',
		valueKey: 'bar',
		options: [
			{foo: 'Foo', bar: 3, id: 3},
			{foo: 'Bar', bar: 4, id: 4}
		],
		value: [4],
		onChange(newValue) {
			value = newValue;
		}
	};
	const result = renderIntoDocument(props);

	const items = getElems(result, 'msts__list-item');
	t.is(items.length, 1);
	t.is(items[0].innerHTML, 'Foo');

	ReactTestUtils.Simulate.click(items[0]);
	t.deepEqual(value, [3]);
});

test('prop labelKey and valueKey filterAvailable', t => {
	const props = {
		labelKey: 'foo',
		valueKey: 'bar',
		searchable: true,
		options: [
			{foo: 'Foo', bar: 3, id: 3}
		]
	};
	const result = renderIntoDocument(props);

	const filters = getElems(result, 'msts__filter-input');
	const availableFilter = filters[0];

	t.is(getElems(result, 'msts__list-item').length, 1);

	availableFilter.value = 'f';
	ReactTestUtils.Simulate.change(availableFilter);
	t.is(getElems(result, 'msts__list-item').length, 1);

	availableFilter.value = 'fb';
	ReactTestUtils.Simulate.change(availableFilter);
	t.is(getElems(result, 'msts__list-item').length, 0);
});

test('prop labelKey and valueKey filterSelected', t => {
	const props = {
		labelKey: 'foo',
		valueKey: 'bar',
		searchable: true,
		options: [
			{foo: 'Foo', bar: 3, id: 3}
		],
		value: [3]
	};
	const result = renderIntoDocument(props);

	const filters = getElems(result, 'msts__filter-input');
	const availableFilter = filters[1];

	t.is(getElems(result, 'msts__list-item').length, 1);

	availableFilter.value = 'f';
	ReactTestUtils.Simulate.change(availableFilter);
	t.is(getElems(result, 'msts__list-item').length, 1, '`f`');

	availableFilter.value = 'fb';
	ReactTestUtils.Simulate.change(availableFilter);
	t.is(getElems(result, 'msts__list-item').length, 0, '`fb`');
});

// Shallow renderer
function createComponent(component, props = {}) {
	const shallowRenderer = ReactTestUtils.createRenderer();
	shallowRenderer.render(React.createElement(component, props));
	return shallowRenderer.getRenderOutput();
}

// Document renderer
function renderIntoDocument(props) {
	return ReactTestUtils.renderIntoDocument(React.createElement(C, props));
}

function getSideAvailable(component) {
	return getElem(component, 'msts__side_available');
}

function getSideSelected(component) {
	return getElem(component, 'msts__side_selected');
}

function getElem(component, className) {
	return ReactTestUtils.findRenderedDOMComponentWithClass(component, className);
}

function getElems(component, className) {
	return ReactTestUtils.scryRenderedDOMComponentsWithClass(component, className);
}
