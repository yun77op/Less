app.define('app', function() {
	var Options = {
		option: function( key, value ) {
			var options = key;
			if ( arguments.length === 0 ) {
				// don't return a reference to the internal hash
				return $.extend( {}, this.options );
			}
			if  (typeof key === "string" ) {
				if ( value === undefined ) {
					return this.options[ key ];
				}
				options = {};
				options[ key ] = value;
			}
			this.options = this.options || {};
			this._setOptions( options );
			return this;
		},

		_setOptions: function( options ) {
			var self = this;
			$.each( options, function( key, value ) {
				self._setOption( key, value );
			});
			return this;
		},

		_setOption: function( key, value ) {
			this.options[ key ] = value;
			return this;
		}
	};

	return {
		Options: Options
	};
});
