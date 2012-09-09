// Copyright (c) 2010 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

app.define('app.ui', function() {

  /**
   * Decorates elements as an instance of a class.
   * @param {string|!Element} source The way to find the element(s) to decorate.
   *     If this is a string then {@code querySeletorAll} is used to find the
   *     elements to decorate.
   * @param {!Function} constr The constructor to decorate with. The constr
   *     needs to have a {@code decorate} function.
   */
  function decorate(source, constr) {
    var elements;
    if (typeof source == 'string')
      elements = app.doc.querySelectorAll(source);
    else
      elements = [source];

    for (var i = 0, el; el = elements[i]; i++) {
      if (!(el instanceof constr))
        constr.decorate(el);
    }
  }

  /**
   * Helper function for creating new element for define.
   */
  function createElementHelper(tagName, opt_bag) {
    // Allow passing in ownerDocument to create in a different document.
    var doc;
    if (opt_bag && opt_bag.ownerDocument)
      doc = opt_bag.ownerDocument;
    else
      doc = app.doc;
    return doc.createElement(tagName);
  }

  /**
   * Creates the constructor for a UI element class.
   *
   * Usage:
   * <pre>
   * var List = app.ui.define('list');
   * List.prototype = {
   *   __proto__: HTMLUListElement.prototype,
   *   decorate: function() {
   *     ...
   *   },
   *   ...
   * };
   * </pre>
   *
   * @param {string|Function} tagNameOrFunction The tagName or
   *     function to use for newly created elements. If this is a function it
   *     needs to return a new element when called.
   * @return {function(Object=):Element} The constructor function which takes
   *     an optional property bag. The function also has a static
   *     {@code decorate} method added to it.
   */
  function define(tagNameOrFunction) {
    var createFunction, tagName;
    if (typeof tagNameOrFunction == 'function') {
      createFunction = tagNameOrFunction;
      tagName = '';
    } else {
      createFunction = createElementHelper;
      tagName = tagNameOrFunction;
    }

    /**
     * Creates a new UI element constructor.
     * @param {Object=} opt_propertyBag Optional bag of properties to set on the
     *     object after created. The property {@code ownerDocument} is special
     *     cased and it allows you to create the element in a different
     *     document than the default.
     * @constructor
     */
    function f(opt_propertyBag) {
      var el = createFunction(tagName, opt_propertyBag);
      f.decorate(el);
      for (var propertyName in opt_propertyBag) {
        el[propertyName] = opt_propertyBag[propertyName];
      }
      return el;
    }

    /**
     * Decorates an element as a UI element class.
     * @param {!Element} el The element to decorate.
     */
    f.decorate = function(el) {
      el.__proto__ = f.prototype;
      el.decorate();
    };

    return f;
  }

  return {
    define: define,
    decorate: decorate
  }
});


app.define('app.options', function() {
  var settings = app.settings;

  /**
   * Sets value of a boolean preference.
   * and signals its changed value.
   * @param {string} name Preference name.
   * @param {boolean} value New preference value.
   */
  function setBooleanPref(name, value) {
    settings.set(name, Boolean(value));
  }

  /**
   * Sets value of an integer preference.
   * and signals its changed value.
   * @param {string} name Preference name.
   * @param {number} value New preference value.
   */
  function setIntegerPref(name, value) {
    settings.set(name, Number(value));
  }

  /**
   * Sets value of a string preference.
   * and signals its changed value.
   * @param {string} name Preference name.
   * @param {string} value New preference value.
   */
  function setStringPref(name, value) {
    settings.set(name, String(value));
  }


    // Define a constructor that uses an input element as its underlying element.
  var PrefCheckbox = app.ui.define('input');

  PrefCheckbox.prototype = {
    // Set up the prototype chain
    __proto__: HTMLInputElement.prototype,

    /**
     * Initialization function for the app.ui framework.
     */
    decorate: function() {
      this.type = 'checkbox';
      var self = this;

      self.initializeValueType(self.getAttribute('value-type'));

      // Listen to pref changes.
      settings.subscribe(this.pref, function(value) {
        // Invert pref value if inverted_pref == true.
        if (self.inverted_pref)
          self.checked = !Boolean(value);
        else
          self.checked = Boolean(value);
      });

      // Listen to user events.
      this.addEventListener(
          'change',
          function(e) {
            if (self.customChangeHandler(e))
              return;
            var value = self.inverted_pref ? !self.checked : self.checked;
            switch(self.valueType) {
              case 'number':
                settings.set(self.pref, Number(value));
                break;
              case 'boolean':
                settings.set(self.pref, value);
                break;
            }
          });
    },

    /**
     * Sets up options in checkbox element.
     * @param {String} valueType The preference type for this checkbox.
     */
    initializeValueType: function(valueType) {
      this.valueType = valueType || 'boolean';
    },

    /**
     * This method is called first while processing an onchange event. If it
     * returns false, regular onchange processing continues (setting the
     * associated pref, etc). If it returns true, the rest of the onchange is
     * not performed. I.e., this works like stopPropagation or cancelBubble.
     * @param {Event} event Change event.
     */
    customChangeHandler: function(event) {
      return false;
    },
  };

  /**
   * The preference name.
   * @type {string}
   */
  app.defineProperty(PrefCheckbox, 'pref', app.PropertyKind.ATTR);


  /**
   * Whether to use inverted pref value.
   * @type {boolean}
   */
  app.defineProperty(PrefCheckbox, 'inverted_pref', app.PropertyKind.BOOL_ATTR);



   /////////////////////////////////////////////////////////////////////////////
  // PrefSelect class:

  // Define a constructor that uses a select element as its underlying element.
  var PrefSelect = app.ui.define('select');

  PrefSelect.prototype = {
    // Set up the prototype chain
    __proto__: HTMLSelectElement.prototype,

    /**
    * Initialization function for the app.ui framework.
    */
    decorate: function() {
      var self = this;

      // Listen to pref changes.
     settings.subscribe(this.pref,
          function(value) {
            var found = false;
            for (var i = 0; i < self.options.length; i++) {
              if (self.options[i].value == value) {
                self.selectedIndex = i;
                found = true;
              }
            }

            // Item not found, select first item.
            if (!found)
              self.selectedIndex = 0;

            if (self.onchange != undefined) {
              var event = new app.Event('change');
              event.value = value;
              self.onchange({value: value});
            }
          });

      // Listen to user events.
      this.addEventListener('change',
          function(e) {
            if (!self.dataType) {
              console.error('undefined data type for <select> pref');
              return;
            }

            switch(self.dataType) {
              case 'number':
                setIntegerPref(self.pref,
                    self.options[self.selectedIndex].value);
                break;
              case 'double':
                setDoublePref(self.pref,
                    self.options[self.selectedIndex].value);
                break;
              case 'boolean':
                var option = self.options[self.selectedIndex];
                var value = (option.value == 'true') ? true : false;
                setBooleanPref(self.pref, value);
                break;
              case 'string':
                setStringPref(self.pref,
                    self.options[self.selectedIndex].value);
                break;
              default:
                console.error('unknown data type for <select> pref: ' +
                              self.dataType);
            }
          });
    },

    /**
     * See |updateDisabledState_| above.
     */
    setDisabled: function(reason, disabled) {
      updateDisabledState_(this, reason, disabled);
    },
  };

  /**
   * The preference name.
   * @type {string}
   */
  app.defineProperty(PrefSelect, 'pref', app.PropertyKind.ATTR);

  /**
   * The data type for the preference options.
   * @type {string}
   */
  app.defineProperty(PrefSelect, 'dataType', app.PropertyKind.ATTR);




  /////////////////////////////////////////////////////////////////////////////
  // PrefNumeric class:

  // Define a constructor that uses an input element as its underlying element.
  var PrefNumeric = function() {};
  PrefNumeric.prototype = {
    // Set up the prototype chain
    __proto__: HTMLInputElement.prototype,

    /**
     * Initialization function for the app.ui framework.
     */
    decorate: function() {
      var self = this;

      // Listen to pref changes.
      settings.subscribe(this.pref,
          function(value) {
            self.value = value;
          });

      // Listen to user events.
      this.addEventListener('change',
          function(e) {
            if (this.validity.valid) {
              setIntegerPref(self.pref, self.value);
            }
          });
    }
  };

  /**
   * The preference name.
   * @type {string}
   */
  app.defineProperty(PrefNumeric, 'pref', app.PropertyKind.ATTR);

  /////////////////////////////////////////////////////////////////////////////
  // PrefNumber class:

  // Define a constructor that uses an input element as its underlying element.
  var PrefNumber = app.ui.define('input');

  PrefNumber.prototype = {
    // Set up the prototype chain
    __proto__: PrefNumeric.prototype,

    /**
     * Initialization function for the app.ui framework.
     */
    decorate: function() {
      this.type = 'number';
      PrefNumeric.prototype.decorate.call(this);

      // Listen to user events.
      this.addEventListener('input',
          function(e) {
            if (this.validity.valid) {
              setIntegerPref(self.pref, self.value);
            }
          });
    }
  };

  return {
    PrefCheckbox: PrefCheckbox,
    PrefSelect: PrefSelect,
    PrefNumber: PrefNumber,
    PrefNumeric: PrefNumeric
  };
});
