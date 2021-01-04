var $module = (function($B){

var _b_ = $B.builtins,
    $s = [],
    i
for(var $b in _b_){$s.push('var ' + $b +' = _b_["'+$b+'"]')}
eval($s.join(';'))

//for(var $py_builtin in _b_){eval("var "+$py_builtin+"=_b_[$py_builtin]")}

var float_check = function(x) {
    if(x.__class__ === $B.long_int){return parseInt(x.value)}
    return _b_.float.$factory(x)
}

function check_int(x){
    if(! _b_.isinstance(x, int)){
        throw _b_.TypeError.$factory("'" + $B.class_name(x) +
            "' object cannot be interpreted as an integer")
    }
}

function check_int_or_round_float(x){
    return (x instanceof Number && x == Math.floor(x)) ||
            _b_.isinstance(x, int)
}

var isWholeNumber = function(x){return (x * 10) % 10 == 0}

var isOdd = function(x) {return isWholeNumber(x) && 2 * Math.floor(x / 2) != x}

var isNegZero = function(x) {return x === 0 && Math.atan2(x,x) < 0}

var EPSILON = Math.pow(2, -52);
var MAX_VALUE = (2 - EPSILON) * Math.pow(2, 1023);
var MIN_VALUE = Math.pow(2, -1022);

function nextUp(x){
    if(x !== x){
        return x
    }
    if(x === -1 / 0){
        return -MAX_VALUE
    }
    if(x === +1 / 0){
        return +1 / 0
    }
    if(x === +MAX_VALUE){
        return +1 / 0
    }
    var y = x * (x < 0 ? 1 - EPSILON / 2 : 1 + EPSILON)
    if(y === x){
        y = MIN_VALUE * EPSILON > 0 ? x + MIN_VALUE * EPSILON : x + MIN_VALUE
    }
    if(y === +1 / 0){
        y = +MAX_VALUE
    }
    var b = x + (y - x) / 2
    if(x < b && b < y){
        y = b;
    }
    var c = (y + x) / 2
    if(x < c && c < y){
        y = c;
    }
    return y === 0 ? -0 : y
}

var _mod = {
    __getattr__: function(attr){
        $B.check_nb_args('__getattr__ ', 1, arguments)
        $B.check_no_kw('__getattr__ ', attr)

        var res = this[attr]
        if(res === undefined){
            throw _b_.AttributeError.$factory(
                'module math has no attribute ' + attr)
        }
        return res
    },
    acos: function(x){
        $B.check_nb_args('acos', 1, arguments)
        $B.check_no_kw('acos', x)
        return float.$factory(Math.acos(float_check(x)))
    },
    acosh: function(x){
        $B.check_nb_args('acosh', 1, arguments)
        $B.check_no_kw('acosh', x)

        if(_b_.$isinf(x)){return float.$factory('inf')}
        var y = float_check(x)
        return float.$factory(Math.log(y + Math.sqrt(y * y - 1)))
    },
    asin: function(x){
        $B.check_nb_args('asin', 1, arguments)
        $B.check_no_kw('asin', x)
        return float.$factory(Math.asin(float_check(x)))
    },
    asinh: function(x){
        $B.check_nb_args('asinh', 1, arguments)
        $B.check_no_kw('asinh', x)

        if(_b_.$isninf(x)){return float.$factory('-inf')}
        if(_b_.$isinf(x)){return float.$factory('inf')}
        var y = float_check(x)
        if(y == 0 && 1 / y === -Infinity){
            return new Number(-0.0)
        }
        return float.$factory(Math.asinh(y))
    },
    atan: function(x){
        $B.check_nb_args('atan', 1, arguments)
        $B.check_no_kw('atan', x)

        if(_b_.$isninf(x)){return float.$factory(-Math.PI / 2)}
        if(_b_.$isinf(x)){return float.$factory(Math.PI / 2)}
        return float.$factory(Math.atan(float_check(x)))
    },
    atan2: function(y, x){
        $B.check_nb_args('atan2', 2, arguments)
        $B.check_no_kw('atan2', y, x)

        return float.$factory(Math.atan2(float_check(y), float_check(x)))
    },
    atanh: function(x){
        $B.check_nb_args('atanh', 1, arguments)
        $B.check_no_kw('atanh', x)

       var y = float_check(x)
       if(y == 0){return 0}
       return float.$factory(0.5 * Math.log((1 / y + 1)/(1 / y - 1)));
    },
    ceil: function(x){
        $B.check_nb_args('ceil', 1, arguments)
        $B.check_no_kw('ceil', x)

       try{return getattr(x, '__ceil__')()}catch(err){}

       if(_b_.$isninf(x)){return float.$factory('-inf')}
       if(_b_.$isinf(x)){return float.$factory('inf')}
       if(isNaN(x)){return float.$factory('nan')}

       var y = float_check(x)
       if(! isNaN(parseFloat(y)) && isFinite(y)){
           return int.$factory(Math.ceil(y))
       }

       throw _b_.ValueError.$factory(
           'object is not a number and does not contain __ceil__')
    },
    comb: function(n, k){
        $B.check_nb_args('comb', 2, arguments)
        $B.check_no_kw('comb', n, k)

        // raise TypeError if n or k is not an integer
        check_int(n)
        check_int(k)

        if(k < 0){
            throw _b_.ValueError.$factory("k must be a non-negative integer")
        }
        if(n < 0){
            throw _b_.ValueError.$factory("n must be a non-negative integer")
        }

        if(k > n){
            return 0
        }
        // Evaluates to n! / (k! * (n - k)!)
        var fn = _mod.factorial(n),
            fk = _mod.factorial(k),
            fn_k = _mod.factorial(n - k)
        return $B.floordiv(fn, $B.mul(fk, fn_k))
    },
    copysign: function(x, y){
        $B.check_nb_args('copysign', 2, arguments)
        $B.check_no_kw('copysign', x,y)

        var x1 = Math.abs(float_check(x))
        var y1 = float_check(y)
        var sign = Math.sign(y1)
        sign = (sign == 1 || Object.is(sign, +0)) ? 1 : - 1
        return float.$factory(x1 * sign)
    },
    cos : function(x){
        $B.check_nb_args('cos ', 1, arguments)
        $B.check_no_kw('cos ', x)
        return float.$factory(Math.cos(float_check(x)))
    },
    cosh: function(x){
        $B.check_nb_args('cosh', 1, arguments)
        $B.check_no_kw('cosh', x)

        if(_b_.$isinf(x)) {return float.$factory('inf')}
        var y = float_check(x)
        if(Math.cosh !== undefined){return float.$factory(Math.cosh(y))}
        return float.$factory((Math.pow(Math.E, y) +
            Math.pow(Math.E, -y)) / 2)
    },
    degrees: function(x){
        $B.check_nb_args('degrees', 1, arguments)
        $B.check_no_kw('degrees', x)
        return float.$factory(float_check(x) * 180 / Math.PI)
    },
    dist: function(p, q){
        $B.check_nb_args('dist', 2, arguments)
        $B.check_no_kw('dist', p, q)
        var itp = _b_.iter(p),
            itq = _b_.iter(q),
            res = 0
        while(true){
            try{
                var next_p = _b_.next(itp)
            }catch(err){
                if(err.__class__ === _b_.StopIteration){
                    // check that the other iterator is also exhausted
                    try{
                        var next_q = _b_.next(itq)
                        throw _b_.ValueError.$factory("both points must have " +
                            "the same number of dimensions")
                    }catch(err){
                        if(err.__class__ === _b_.StopIteration){
                            if(typeof res == "number" || res instanceof Number){
                                return Math.sqrt(res)
                            }else{
                                return Math.sqrt(parseInt(res.value))
                            }
                        }
                        throw err
                    }
                }
                throw err
            }
            try{
                var next_q = _b_.next(itq),
                    diff = $B.sub(next_p, next_q)
                res = $B.add(res, $B.mul(diff, diff))
            }catch(err){
                if(err.__class__ === _b_.StopIteration){
                    throw _b_.ValueError.$factory("both points must have " +
                        "the same number of dimensions")
                }
                throw err
            }
        }
    },
    e: float.$factory(Math.E),
    erf: function(x){
        $B.check_nb_args('erf', 1, arguments)
        $B.check_no_kw('erf', x)

        // inspired from
        // http://stackoverflow.com/questions/457408/is-there-an-easily-available-implementation-of-erf-for-python
        var y = float_check(x)
        var t = 1.0 / (1.0 + 0.5 * Math.abs(y))
        var ans = 1 - t * Math.exp( -y * y - 1.26551223 +
                     t * ( 1.00002368 +
                     t * ( 0.37409196 +
                     t * ( 0.09678418 +
                     t * (-0.18628806 +
                     t * ( 0.27886807 +
                     t * (-1.13520398 +
                     t * ( 1.48851587 +
                     t * (-0.82215223 +
                     t * 0.17087277)))))))))
        if(y >= 0.0){return ans}
        return -ans
    },
    erfc: function(x){

        $B.check_nb_args('erfc', 1, arguments)
        $B.check_no_kw('erfc', x)

        // inspired from
        // http://stackoverflow.com/questions/457408/is-there-an-easily-available-implementation-of-erf-for-python
        var y = float_check(x)
        var t = 1.0 / (1.0 + 0.5 * Math.abs(y))
        var ans = 1 - t * Math.exp( -y * y - 1.26551223 +
                     t * ( 1.00002368 +
                     t * ( 0.37409196 +
                     t * ( 0.09678418 +
                     t * (-0.18628806 +
                     t * ( 0.27886807 +
                     t * (-1.13520398 +
                     t * ( 1.48851587 +
                     t * (-0.82215223 +
                     t * 0.17087277)))))))))
        if(y >= 0.0){return 1 - ans}
        return 1 + ans
    },
    exp: function(x){
        $B.check_nb_args('exp', 1, arguments)
        $B.check_no_kw('exp', x)

         if(_b_.$isninf(x)){return float.$factory(0)}
         if(_b_.$isinf(x)){return float.$factory('inf')}
         var _r = Math.exp(float_check(x))
         if(_b_.$isinf(_r)){throw _b_.OverflowError.$factory("math range error")}
         return float.$factory(_r)
    },
    expm1: function(x){
        $B.check_nb_args('expm1', 1, arguments)
        $B.check_no_kw('expm1', x)

         if(_b_.$isninf(x)){return float.$factory(0)}
         if(_b_.$isinf(x)){return float.$factory('inf')}
         var _r = Math.expm1(float_check(x))
         if(_b_.$isinf(_r)){throw _b_.OverflowError.$factory("math range error")}
         return float.$factory(_r)
    },
    //fabs: function(x){ return x>0?float.$factory(x):float.$factory(-x)},
    fabs: function(x){
        $B.check_nb_args('fabs', 1, arguments)
        $B.check_no_kw('fabs', x)
        return _b_.$fabs(x) // located in py_float.js
    },
    factorial: function(x){
        $B.check_nb_args('factorial', 1, arguments)
        $B.check_no_kw('factorial', x)

         //using code from http://stackoverflow.com/questions/3959211/fast-factorial-function-in-javascript
         if(! check_int_or_round_float(x)){
             throw _b_.ValueError.$factory("factorial() only accepts integral values")
         }else if($B.rich_comp("__lt__", x, 0)){
             throw _b_.ValueError.$factory("factorial() not defined for negative values")
         }
         var r = 1
         for(var i = 2; i <= x; i++){
             r = $B.mul(r, i)
         }
         return r
    },
    floor: function(x){
        $B.check_nb_args('floor', 1, arguments)
        $B.check_no_kw('floor', x)
        return Math.floor(float_check(x))
    },
    fmod: function(x,y){
        $B.check_nb_args('fmod', 2, arguments)
        $B.check_no_kw('fmod', x,y)
        return float.$factory(float_check(x) % float_check(y))
    },
    frexp: function(x){
        $B.check_nb_args('frexp', 1, arguments)
        $B.check_no_kw('frexp', x)

        var _l = _b_.$frexp(x)
        return _b_.tuple.$factory([float.$factory(_l[0]), _l[1]])
    },
    fsum: function(x){
        $B.check_nb_args('fsum', 1, arguments)
        $B.check_no_kw('fsum', x)

        /* Translation into Javascript of the function msum in an Active
           State Cookbook recipe : https://code.activestate.com/recipes/393090/
           by Raymond Hettinger
        */
        var partials = [],
            res = new Number(),
            _it = _b_.iter(x)
        while(true){
            try{
                var x = _b_.next(_it),
                    i = 0
                for(var j = 0, len = partials.length; j < len; j++){
                    var y = partials[j]
                    if(Math.abs(x) < Math.abs(y)){
                        var z = x
                        x = y
                        y = z
                    }
                    var hi = x + y,
                        lo = y - (hi - x)
                    if(lo){
                        partials[i] = lo
                        i++
                    }
                    x = hi
                }
                partials = partials.slice(0, i).concat([x])
            }catch(err){
                if(_b_.isinstance(err, _b_.StopIteration)){break}
                throw err
            }
        }
        var res = new Number(0)
        for(var i = 0; i < partials.length; i++){
            res += new Number(partials[i])
        }
        return new Number(res)
    },
    gamma: function(x){
        $B.check_nb_args('gamma', 1, arguments)
        $B.check_no_kw('gamma', x)

        if(_b_.isinstance(x, int)){
            if(i < 1){
                throw _b_.ValueError.$factory("math domain error")
            }
            var res = 1
            for(var i = 1; i < x; i++){res *= i}
            return new Number(res)
        }
        // Adapted from https://en.wikipedia.org/wiki/Lanczos_approximation
        var p = [676.5203681218851,
            -1259.1392167224028,
            771.32342877765313,
            -176.61502916214059,
            12.507343278686905,
            -0.13857109526572012,
            9.9843695780195716e-6,
            1.5056327351493116e-7
            ]

        var EPSILON = 1e-07
        function drop_imag(z){
            if(Math.abs(z.imag) <= EPSILON){
                z = z.real
            }
            return z
        }
        var z = x
        if(z < 0.5){
            var y = Math.PI / (Math.sin(Math.PI * z) * _mod.gamma(1-z)) // Reflection formula
        }else{
            z -= 1
            var x = 0.99999999999980993,
                i = 0
            for(var i = 0, len = p.length; i < len; i++){
                var pval = p[i]
                x += pval / (z + i + 1)
            }
            var t = z + p.length - 0.5,
                sq = Math.sqrt(2 * Math.PI),
                y = sq * Math.pow(t, (z + 0.5)) * Math.exp(-t) * x
        }
        return drop_imag(y)
    },
    gcd: function(){
        var $ = $B.args("gcd", 2, {a: null, b: null}, ['a', 'b'],
                arguments, {}, null, null),
            a = $B.PyNumber_Index($.a),
            b = $B.PyNumber_Index($.b)
        if(a == 0 && b == 0){return 0}
        // https://stackoverflow.com/questions/17445231/js-how-to-find-the-greatest-common-divisor
        a = _b_.abs(a)
        b = _b_.abs(b)
        if($B.rich_comp("__gt__", b, a)){
            var temp = a
            a = b
            b = temp
        }
        while(true){
            if(b == 0){
                return a
            }
            a = $B.rich_op("mod", a, b)
            if(a == 0){
                return b
            }
            b = $B.rich_op("mod", b, a)
        }
    },
    hypot: function(x, y){
        var $ = $B.args("hypot", 2, {x: null, y:null}, ['x', 'y'],
                    arguments, {}, "args", null),
            args = [x, y].concat($.args),
            res = 0
        return float.$factory(Math.hypot(...args))
    },
    inf: float.$factory('inf'),
    isclose: function(){
        var $ns = $B.args("isclose",
                          4,
                          {a: null, b: null, rel_tol: null, abs_tol: null},
                          ['a', 'b', 'rel_tol', 'abs_tol'],
                          arguments,
                          {rel_tol: 1e-09, abs_tol: 0.0},
                          '*',
                          null)
        var a = $ns['a'],
            b = $ns['b'],
            rel_tol = $ns['rel_tol'],
            abs_tol = $ns['abs_tol']
        if(rel_tol < 0.0 || abs_tol < 0.0){
            throw ValueError.$factory('tolerances must be non-negative')
        }
        if(typeof a !== "number" || typeof b !== "number"){
            if(! _b_.isinstance(a, [_b_.float, _b_.int]) ||
                    ! _b_.isinstance(b, [_b_.float, _b_.int])){
                throw _b_.TypeError.$factory("must be real number, not str")
            }
        }
        if(a == b){
            return True
        }
        if(_b_.$isinf(a) || _b_.$isinf(b)){
            return a === b
        }
        var diff = _b_.$fabs(b - a)
        var result = (
            (diff <= _b_.$fabs(rel_tol * b)) ||
                (diff <= _b_.$fabs(rel_tol * a))
            ) || (diff <= _b_.$fabs(abs_tol)
        )
        return result
    },
    isfinite: function(x){
        $B.check_nb_args('isfinite', 1, arguments)
        $B.check_no_kw('isfinite', x)
        return isFinite(float_check(x))
    },
    isinf: function(x){
        $B.check_nb_args('isinf', 1, arguments)
        $B.check_no_kw('isinf', x)
        return _b_.$isinf(float_check(x))
    },
    isnan: function(x){
        $B.check_nb_args('isnan', 1, arguments)
        $B.check_no_kw('isnan', x)
        return isNaN(float_check(x))
    },
    isqrt: function(x){
        $B.check_nb_args('isqrt', 1, arguments)
        $B.check_no_kw('isqrt', x)

        x = $B.PyNumber_Index(x)
        if($B.rich_comp("__lt__", x, 0)){
            throw _b_.ValueError.$factory(
                "isqrt() argument must be nonnegative")
        }
        if(typeof x == "number"){
            return Math.floor(Math.sqrt(x))
        }else{ // big integer
            var v = parseInt(x.value),
                candidate = Math.floor(Math.sqrt(v)),
                c1
            // Use successive approximations : sqr = (sqr + (x / sqr)) / 2
            // Limit to 100 iterations
            for(var i = 0; i < 100; i++){
                c1 = $B.floordiv($B.add(candidate,
                    $B.floordiv(x, candidate)), 2)
                if(c1 === candidate || c1.value === candidate.value){
                    break
                }
                candidate = c1
            }
            if($B.rich_comp("__gt__", $B.mul(candidate, candidate), x)){
                // Result might be greater by 1
                candidate = $B.sub(candidate, 1)
            }
            return candidate
        }
    },
    lcm: function(){
        var $ = $B.args("lcm", 0, {}, [], arguments, {}, 'args', null),
            product = 1
        for(var arg of $.args){
            product = $B.mul(product, $B.PyNumber_Index(arg))
        }
        var gcd = $module.gcd.apply(null, arguments)
        return $B.$getattr(product, "__floordiv__")(gcd)
    },
    ldexp: function(x, i){
        $B.check_nb_args('ldexp', 2, arguments)
        $B.check_no_kw('ldexp', x, i)
        return _b_.$ldexp(x, i)   //located in py_float.js
    },
    lgamma: function(x){
        $B.check_nb_args('lgamma', 1, arguments)
        $B.check_no_kw('lgamma', x)

        return new Number(Math.log(Math.abs(_mod.gamma(x))))
    },
    log: function(x, base){
        var $ = $B.args("log", 2, {x: null, base: null}, ['x', 'base'],
            arguments, {base: _b_.None}, null, null),
            x = $.x,
            base = $.base

         var x1 = float_check(x)
         if(base === _b_.None){return float.$factory(Math.log(x1))}
         return float.$factory(Math.log(x1) / Math.log(float_check(base)))
    },
    log1p: function(x){
        $B.check_nb_args('log1p', 1, arguments)
        $B.check_no_kw('log1p', x)
        return float.$factory(Math.log1p(float_check(x)))
    },
    log2: function(x){
        $B.check_nb_args('log2', 1, arguments)
        $B.check_no_kw('log2', x)

        if(isNaN(x)){return float.$factory('nan')}
        if(_b_.$isninf(x)) {throw ValueError.$factory('')}
        var x1 = float_check(x)
        if(x1 < 0.0){throw ValueError.$factory('')}
        return float.$factory(Math.log(x1) / Math.LN2)
    },
    log10: function(x){
        $B.check_nb_args('log10', 1, arguments)
        $B.check_no_kw('log10', x)

        return float.$factory(Math.log10(float_check(x)))
    },
    modf: function(x){
        $B.check_nb_args('modf', 1, arguments)
        $B.check_no_kw('modf', x)

       if(_b_.$isninf(x)){
           return _b_.tuple.$factory([0.0, float.$factory('-inf')])
       }
       if(_b_.$isinf(x)){
           return _b_.tuple.$factory([0.0, float.$factory('inf')])
       }
       if(isNaN(x)){
           return _b_.tuple.$factory([float.$factory('nan'),
               float.$factory('nan')])
       }

       var x1 = float_check(x)
       if(x1 > 0){
          var i = float.$factory(x1 - Math.floor(x1))
          return _b_.tuple.$factory([i, float.$factory(x1 - i)])
       }

       var x2 = Math.ceil(x1)
       var i = float.$factory(x1 - x2)
       return _b_.tuple.$factory([i, float.$factory(x2)])
    },
    nan: float.$factory('nan'),
    nextafter: function(){
        var $ = $B.args("nextafter", 2, {x: null, y: null}, ['x', 'y'],
                    arguments, {}, null, null),
            x = $.x,
            y = $.y

        return y < x ? -nextUp(-x) : (y > x ? nextUp(x) : (x !== x ? x : y))
    },
    perm: function(n, k){
        var $ = $B.args("perm", 2, {n: null, k: null}, ['n', 'k'],
                        arguments, {k: _b_.None}, null, null),
            n = $.n,
            k = $.k

        if(k === _b_.None){
            check_int(n)
            return _mod.factorial(n)
        }
        // raise TypeError if n or k is not an integer
        check_int(n)
        check_int(k)

        if(k < 0){
            throw _b_.ValueError.$factory("k must be a non-negative integer")
        }
        if(n < 0){
            throw _b_.ValueError.$factory("n must be a non-negative integer")
        }

        if(k > n){
            return 0
        }
        // Evaluates to n! / (n - k)!
        var fn = _mod.factorial(n),
            fn_k = _mod.factorial(n - k)
        return $B.floordiv(fn, fn_k)
    },
    pi : float.$factory(Math.PI),
    pow: function(x, y){
        $B.check_nb_args('pow', 2, arguments)
        $B.check_no_kw('pow', x,y)

        var x1 = float_check(x)
        var y1 = float_check(y)
        if(y1 == 0){return float.$factory(1)}
        if(x1 == 0 && y1 < 0){throw _b_.ValueError.$factory('')}

        if(isNaN(y1)){
            if(x1 == 1){return float.$factory(1)}
            return float.$factory('nan')
        }
        if(x1 == 0){return float.$factory(0)}

        if(_b_.$isninf(y)){
            if(x1 == 1 || x1 == -1){return float.$factory(1)}
            if(x1 < 1 && x1 > -1){return float.$factory('inf')}
            return float.$factory(0)
        }
        if(_b_.$isinf(y)){
            if(x1 == 1 || x1 == -1){return float.$factory(1)}
            if(x1 < 1 && x1 > -1){return float.$factory(0)}
            return float.$factory('inf')
        }

        if(isNaN(x1)){return float.$factory('nan')}
        if(_b_.$isninf(x)){
            if(y1 > 0 && isOdd(y1)){return float.$factory('-inf')}
            if(y1 > 0){return float.$factory('inf')}  // this is even or a float
            if(y1 < 0){return float.$factory(0)}
            return float.$factory(1)
        }

        if(_b_.$isinf(x)){
            if(y1 > 0){return float.$factory('inf')}
            if(y1 < 0){return float.$factory(0)}
            return float.$factory(1)
        }

        var r = Math.pow(x1, y1)
        if(isNaN(r)){return float.$factory('nan')}
        if(_b_.$isninf(r)){return float.$factory('-inf')}
        if(_b_.$isinf(r)){return float.$factory('inf')}

        return r
    },
    prod: function(){
        var $ = $B.args("prod", 1, {iterable:null, start:null},
                        ["iterable", "start"], arguments, {start: 1}, "*",
                        null),
            iterable = $.iterable,
            start = $.start
        var res = start,
            it = _b_.iter(iterable),
            x
        while(true){
            try{
                x = _b_.next(it)
                if(x == 0){
                    return 0
                }
                res = $B.mul(res, x)
            }catch(err){
                if(err.__class__ === _b_.StopIteration){
                    return res
                }
                throw err
            }
        }
    },
    radians: function(x){
        $B.check_nb_args('radians', 1, arguments)
        $B.check_no_kw('radians', x)

        return float.$factory(float_check(x) * Math.PI / 180)
    },
    sin : function(x){
        $B.check_nb_args('sin ', 1, arguments)
        $B.check_no_kw('sin ', x)
        return float.$factory(Math.sin(float_check(x)))},
    sinh: function(x) {
        $B.check_nb_args('sinh', 1, arguments)
        $B.check_no_kw('sinh', x)

        var y = float_check(x)
        if(Math.sinh !== undefined){return float.$factory(Math.sinh(y))}
        return float.$factory(
            (Math.pow(Math.E, y) - Math.pow(Math.E, -y)) / 2)
    },
    sqrt: function(x){
        $B.check_nb_args('sqrt ', 1, arguments)
        $B.check_no_kw('sqrt ', x)

      var y = float_check(x)
      if(y < 0){throw ValueError.$factory("math range error")}
      if(_b_.$isinf(y)){return float.$factory('inf')}
      var _r = Math.sqrt(y)
      if(_b_.$isinf(_r)){throw _b_.OverflowError.$factory("math range error")}
      return float.$factory(_r)
    },
    tan: function(x) {
        $B.check_nb_args('tan', 1, arguments)
        $B.check_no_kw('tan', x)

        var y = float_check(x)
        return float.$factory(Math.tan(y))
    },
    tanh: function(x) {
        $B.check_nb_args('tanh', 1, arguments)
        $B.check_no_kw('tanh', x)

        var y = float_check(x)
        if(Math.tanh !== undefined){return float.$factory(Math.tanh(y))}
        return float.$factory((Math.pow(Math.E, y) - Math.pow(Math.E, -y))/
             (Math.pow(Math.E, y) + Math.pow(Math.E, -y)))
    },
    tau: 6.283185307179586,
    trunc: function(x) {
        $B.check_nb_args('trunc', 1, arguments)
        $B.check_no_kw('trunc', x)

       try{return getattr(x, '__trunc__')()}catch(err){}
       var x1 = float_check(x)
       if(!isNaN(parseFloat(x1)) && isFinite(x1)){
          if(Math.trunc !== undefined){return int.$factory(Math.trunc(x1))}
          if(x1 > 0){return int.$factory(Math.floor(x1))}
          return int.$factory(Math.ceil(x1))  // x1 < 0
       }
       throw _b_.ValueError.$factory(
           'object is not a number and does not contain __trunc__')
    },
    ulp: function(){
        var $ = $B.args("ulp", 1, {x: null}, ['x'], arguments, {}, null, null),
            x = $.x
        return x > 0 ? nextUp(x) - x : x - (-nextUp(-x))
    }
}

for(var $attr in _mod){
    if(typeof _mod[$attr] === 'function'){
        _mod[$attr].__class__ = $B.builtin_function
    }
}

return _mod

})(__BRYTHON__)
