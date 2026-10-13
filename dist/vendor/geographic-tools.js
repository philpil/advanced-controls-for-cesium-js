var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) =>
  function __require() {
    try {
      return (
        mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod),
        mod.exports
      );
    } catch (e) {
      throw ((mod = 0), e);
    }
  };
var __copyProps = (to, from, except, desc) => {
  if ((from && typeof from === 'object') || typeof from === 'function') {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
        });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (
  (target = mod != null ? __create(__getProtoOf(mod)) : {}),
  __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule
      ? __defProp(target, 'default', { value: mod, enumerable: true })
      : target,
    mod,
  )
);

// node_modules/polygon-clipping/dist/polygon-clipping.umd.js
var require_polygon_clipping_umd = __commonJS({
  'node_modules/polygon-clipping/dist/polygon-clipping.umd.js'(exports, module) {
    (function (global, factory) {
      typeof exports === 'object' && typeof module !== 'undefined'
        ? (module.exports = factory())
        : typeof define === 'function' && define.amd
          ? define(factory)
          : ((global = typeof globalThis !== 'undefined' ? globalThis : global || self),
            (global.polygonClipping = factory()));
    })(exports, function () {
      'use strict';
      function __generator(thisArg, body) {
        var _ = {
            label: 0,
            sent: function () {
              if (t[0] & 1) throw t[1];
              return t[1];
            },
            trys: [],
            ops: [],
          },
          f,
          y,
          t,
          g;
        return (
          (g = {
            next: verb(0),
            throw: verb(1),
            return: verb(2),
          }),
          typeof Symbol === 'function' &&
            (g[Symbol.iterator] = function () {
              return this;
            }),
          g
        );
        function verb(n) {
          return function (v) {
            return step([n, v]);
          };
        }
        function step(op) {
          if (f) throw new TypeError('Generator is already executing.');
          while (_)
            try {
              if (
                ((f = 1),
                y &&
                  (t =
                    op[0] & 2
                      ? y['return']
                      : op[0]
                        ? y['throw'] || ((t = y['return']) && t.call(y), 0)
                        : y.next) &&
                  !(t = t.call(y, op[1])).done)
              )
                return t;
              if (((y = 0), t)) op = [op[0] & 2, t.value];
              switch (op[0]) {
                case 0:
                case 1:
                  t = op;
                  break;
                case 4:
                  _.label++;
                  return {
                    value: op[1],
                    done: false,
                  };
                case 5:
                  _.label++;
                  y = op[1];
                  op = [0];
                  continue;
                case 7:
                  op = _.ops.pop();
                  _.trys.pop();
                  continue;
                default:
                  if (
                    !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                    (op[0] === 6 || op[0] === 2)
                  ) {
                    _ = 0;
                    continue;
                  }
                  if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                    _.label = op[1];
                    break;
                  }
                  if (op[0] === 6 && _.label < t[1]) {
                    _.label = t[1];
                    t = op;
                    break;
                  }
                  if (t && _.label < t[2]) {
                    _.label = t[2];
                    _.ops.push(op);
                    break;
                  }
                  if (t[2]) _.ops.pop();
                  _.trys.pop();
                  continue;
              }
              op = body.call(thisArg, _);
            } catch (e) {
              op = [6, e];
              y = 0;
            } finally {
              f = t = 0;
            }
          if (op[0] & 5) throw op[1];
          return {
            value: op[0] ? op[1] : void 0,
            done: true,
          };
        }
      }
      var Node =
        /** @class */
        /* @__PURE__ */ (function () {
          function Node2(key, data) {
            this.next = null;
            this.key = key;
            this.data = data;
            this.left = null;
            this.right = null;
          }
          return Node2;
        })();
      function DEFAULT_COMPARE(a, b) {
        return a > b ? 1 : a < b ? -1 : 0;
      }
      function splay(i, t, comparator) {
        var N = new Node(null, null);
        var l = N;
        var r = N;
        while (true) {
          var cmp2 = comparator(i, t.key);
          if (cmp2 < 0) {
            if (t.left === null) break;
            if (comparator(i, t.left.key) < 0) {
              var y = t.left;
              t.left = y.right;
              y.right = t;
              t = y;
              if (t.left === null) break;
            }
            r.left = t;
            r = t;
            t = t.left;
          } else if (cmp2 > 0) {
            if (t.right === null) break;
            if (comparator(i, t.right.key) > 0) {
              var y = t.right;
              t.right = y.left;
              y.left = t;
              t = y;
              if (t.right === null) break;
            }
            l.right = t;
            l = t;
            t = t.right;
          } else break;
        }
        l.right = t.left;
        r.left = t.right;
        t.left = N.right;
        t.right = N.left;
        return t;
      }
      function insert(i, data, t, comparator) {
        var node = new Node(i, data);
        if (t === null) {
          node.left = node.right = null;
          return node;
        }
        t = splay(i, t, comparator);
        var cmp2 = comparator(i, t.key);
        if (cmp2 < 0) {
          node.left = t.left;
          node.right = t;
          t.left = null;
        } else if (cmp2 >= 0) {
          node.right = t.right;
          node.left = t;
          t.right = null;
        }
        return node;
      }
      function split(key, v, comparator) {
        var left = null;
        var right = null;
        if (v) {
          v = splay(key, v, comparator);
          var cmp2 = comparator(v.key, key);
          if (cmp2 === 0) {
            left = v.left;
            right = v.right;
          } else if (cmp2 < 0) {
            right = v.right;
            v.right = null;
            left = v;
          } else {
            left = v.left;
            v.left = null;
            right = v;
          }
        }
        return {
          left,
          right,
        };
      }
      function merge(left, right, comparator) {
        if (right === null) return left;
        if (left === null) return right;
        right = splay(left.key, right, comparator);
        right.left = left;
        return right;
      }
      function printRow(root, prefix, isTail, out, printNode) {
        if (root) {
          out(
            '' +
              prefix +
              (isTail ? '\u2514\u2500\u2500 ' : '\u251C\u2500\u2500 ') +
              printNode(root) +
              '\n',
          );
          var indent = prefix + (isTail ? '    ' : '\u2502   ');
          if (root.left) printRow(root.left, indent, false, out, printNode);
          if (root.right) printRow(root.right, indent, true, out, printNode);
        }
      }
      var Tree =
        /** @class */
        (function () {
          function Tree2(comparator) {
            if (comparator === void 0) {
              comparator = DEFAULT_COMPARE;
            }
            this._root = null;
            this._size = 0;
            this._comparator = comparator;
          }
          Tree2.prototype.insert = function (key, data) {
            this._size++;
            return (this._root = insert(key, data, this._root, this._comparator));
          };
          Tree2.prototype.add = function (key, data) {
            var node = new Node(key, data);
            if (this._root === null) {
              node.left = node.right = null;
              this._size++;
              this._root = node;
            }
            var comparator = this._comparator;
            var t = splay(key, this._root, comparator);
            var cmp2 = comparator(key, t.key);
            if (cmp2 === 0) this._root = t;
            else {
              if (cmp2 < 0) {
                node.left = t.left;
                node.right = t;
                t.left = null;
              } else if (cmp2 > 0) {
                node.right = t.right;
                node.left = t;
                t.right = null;
              }
              this._size++;
              this._root = node;
            }
            return this._root;
          };
          Tree2.prototype.remove = function (key) {
            this._root = this._remove(key, this._root, this._comparator);
          };
          Tree2.prototype._remove = function (i, t, comparator) {
            var x;
            if (t === null) return null;
            t = splay(i, t, comparator);
            var cmp2 = comparator(i, t.key);
            if (cmp2 === 0) {
              if (t.left === null) {
                x = t.right;
              } else {
                x = splay(i, t.left, comparator);
                x.right = t.right;
              }
              this._size--;
              return x;
            }
            return t;
          };
          Tree2.prototype.pop = function () {
            var node = this._root;
            if (node) {
              while (node.left) node = node.left;
              this._root = splay(node.key, this._root, this._comparator);
              this._root = this._remove(node.key, this._root, this._comparator);
              return {
                key: node.key,
                data: node.data,
              };
            }
            return null;
          };
          Tree2.prototype.findStatic = function (key) {
            var current = this._root;
            var compare = this._comparator;
            while (current) {
              var cmp2 = compare(key, current.key);
              if (cmp2 === 0) return current;
              else if (cmp2 < 0) current = current.left;
              else current = current.right;
            }
            return null;
          };
          Tree2.prototype.find = function (key) {
            if (this._root) {
              this._root = splay(key, this._root, this._comparator);
              if (this._comparator(key, this._root.key) !== 0) return null;
            }
            return this._root;
          };
          Tree2.prototype.contains = function (key) {
            var current = this._root;
            var compare = this._comparator;
            while (current) {
              var cmp2 = compare(key, current.key);
              if (cmp2 === 0) return true;
              else if (cmp2 < 0) current = current.left;
              else current = current.right;
            }
            return false;
          };
          Tree2.prototype.forEach = function (visitor, ctx) {
            var current = this._root;
            var Q = [];
            var done = false;
            while (!done) {
              if (current !== null) {
                Q.push(current);
                current = current.left;
              } else {
                if (Q.length !== 0) {
                  current = Q.pop();
                  visitor.call(ctx, current);
                  current = current.right;
                } else done = true;
              }
            }
            return this;
          };
          Tree2.prototype.range = function (low, high, fn, ctx) {
            var Q = [];
            var compare = this._comparator;
            var node = this._root;
            var cmp2;
            while (Q.length !== 0 || node) {
              if (node) {
                Q.push(node);
                node = node.left;
              } else {
                node = Q.pop();
                cmp2 = compare(node.key, high);
                if (cmp2 > 0) {
                  break;
                } else if (compare(node.key, low) >= 0) {
                  if (fn.call(ctx, node)) return this;
                }
                node = node.right;
              }
            }
            return this;
          };
          Tree2.prototype.keys = function () {
            var keys = [];
            this.forEach(function (_a) {
              var key = _a.key;
              return keys.push(key);
            });
            return keys;
          };
          Tree2.prototype.values = function () {
            var values = [];
            this.forEach(function (_a) {
              var data = _a.data;
              return values.push(data);
            });
            return values;
          };
          Tree2.prototype.min = function () {
            if (this._root) return this.minNode(this._root).key;
            return null;
          };
          Tree2.prototype.max = function () {
            if (this._root) return this.maxNode(this._root).key;
            return null;
          };
          Tree2.prototype.minNode = function (t) {
            if (t === void 0) {
              t = this._root;
            }
            if (t) while (t.left) t = t.left;
            return t;
          };
          Tree2.prototype.maxNode = function (t) {
            if (t === void 0) {
              t = this._root;
            }
            if (t) while (t.right) t = t.right;
            return t;
          };
          Tree2.prototype.at = function (index2) {
            var current = this._root;
            var done = false;
            var i = 0;
            var Q = [];
            while (!done) {
              if (current) {
                Q.push(current);
                current = current.left;
              } else {
                if (Q.length > 0) {
                  current = Q.pop();
                  if (i === index2) return current;
                  i++;
                  current = current.right;
                } else done = true;
              }
            }
            return null;
          };
          Tree2.prototype.next = function (d) {
            var root = this._root;
            var successor = null;
            if (d.right) {
              successor = d.right;
              while (successor.left) successor = successor.left;
              return successor;
            }
            var comparator = this._comparator;
            while (root) {
              var cmp2 = comparator(d.key, root.key);
              if (cmp2 === 0) break;
              else if (cmp2 < 0) {
                successor = root;
                root = root.left;
              } else root = root.right;
            }
            return successor;
          };
          Tree2.prototype.prev = function (d) {
            var root = this._root;
            var predecessor = null;
            if (d.left !== null) {
              predecessor = d.left;
              while (predecessor.right) predecessor = predecessor.right;
              return predecessor;
            }
            var comparator = this._comparator;
            while (root) {
              var cmp2 = comparator(d.key, root.key);
              if (cmp2 === 0) break;
              else if (cmp2 < 0) root = root.left;
              else {
                predecessor = root;
                root = root.right;
              }
            }
            return predecessor;
          };
          Tree2.prototype.clear = function () {
            this._root = null;
            this._size = 0;
            return this;
          };
          Tree2.prototype.toList = function () {
            return toList(this._root);
          };
          Tree2.prototype.load = function (keys, values, presort) {
            if (values === void 0) {
              values = [];
            }
            if (presort === void 0) {
              presort = false;
            }
            var size = keys.length;
            var comparator = this._comparator;
            if (presort) sort(keys, values, 0, size - 1, comparator);
            if (this._root === null) {
              this._root = loadRecursive(keys, values, 0, size);
              this._size = size;
            } else {
              var mergedList = mergeLists(this.toList(), createList(keys, values), comparator);
              size = this._size + size;
              this._root = sortedListToBST(
                {
                  head: mergedList,
                },
                0,
                size,
              );
            }
            return this;
          };
          Tree2.prototype.isEmpty = function () {
            return this._root === null;
          };
          Object.defineProperty(Tree2.prototype, 'size', {
            get: function () {
              return this._size;
            },
            enumerable: true,
            configurable: true,
          });
          Object.defineProperty(Tree2.prototype, 'root', {
            get: function () {
              return this._root;
            },
            enumerable: true,
            configurable: true,
          });
          Tree2.prototype.toString = function (printNode) {
            if (printNode === void 0) {
              printNode = function (n) {
                return String(n.key);
              };
            }
            var out = [];
            printRow(
              this._root,
              '',
              true,
              function (v) {
                return out.push(v);
              },
              printNode,
            );
            return out.join('');
          };
          Tree2.prototype.update = function (key, newKey, newData) {
            var comparator = this._comparator;
            var _a = split(key, this._root, comparator),
              left = _a.left,
              right = _a.right;
            if (comparator(key, newKey) < 0) {
              right = insert(newKey, newData, right, comparator);
            } else {
              left = insert(newKey, newData, left, comparator);
            }
            this._root = merge(left, right, comparator);
          };
          Tree2.prototype.split = function (key) {
            return split(key, this._root, this._comparator);
          };
          Tree2.prototype[Symbol.iterator] = function () {
            var current, Q, done;
            return __generator(this, function (_a) {
              switch (_a.label) {
                case 0:
                  current = this._root;
                  Q = [];
                  done = false;
                  _a.label = 1;
                case 1:
                  if (!!done) return [3, 6];
                  if (!(current !== null)) return [3, 2];
                  Q.push(current);
                  current = current.left;
                  return [3, 5];
                case 2:
                  if (!(Q.length !== 0)) return [3, 4];
                  current = Q.pop();
                  return [4, current];
                case 3:
                  _a.sent();
                  current = current.right;
                  return [3, 5];
                case 4:
                  done = true;
                  _a.label = 5;
                case 5:
                  return [3, 1];
                case 6:
                  return [
                    2,
                    /*return*/
                  ];
              }
            });
          };
          return Tree2;
        })();
      function loadRecursive(keys, values, start, end) {
        var size = end - start;
        if (size > 0) {
          var middle = start + Math.floor(size / 2);
          var key = keys[middle];
          var data = values[middle];
          var node = new Node(key, data);
          node.left = loadRecursive(keys, values, start, middle);
          node.right = loadRecursive(keys, values, middle + 1, end);
          return node;
        }
        return null;
      }
      function createList(keys, values) {
        var head = new Node(null, null);
        var p = head;
        for (var i = 0; i < keys.length; i++) {
          p = p.next = new Node(keys[i], values[i]);
        }
        p.next = null;
        return head.next;
      }
      function toList(root) {
        var current = root;
        var Q = [];
        var done = false;
        var head = new Node(null, null);
        var p = head;
        while (!done) {
          if (current) {
            Q.push(current);
            current = current.left;
          } else {
            if (Q.length > 0) {
              current = p = p.next = Q.pop();
              current = current.right;
            } else done = true;
          }
        }
        p.next = null;
        return head.next;
      }
      function sortedListToBST(list, start, end) {
        var size = end - start;
        if (size > 0) {
          var middle = start + Math.floor(size / 2);
          var left = sortedListToBST(list, start, middle);
          var root = list.head;
          root.left = left;
          list.head = list.head.next;
          root.right = sortedListToBST(list, middle + 1, end);
          return root;
        }
        return null;
      }
      function mergeLists(l1, l2, compare) {
        var head = new Node(null, null);
        var p = head;
        var p1 = l1;
        var p2 = l2;
        while (p1 !== null && p2 !== null) {
          if (compare(p1.key, p2.key) < 0) {
            p.next = p1;
            p1 = p1.next;
          } else {
            p.next = p2;
            p2 = p2.next;
          }
          p = p.next;
        }
        if (p1 !== null) {
          p.next = p1;
        } else if (p2 !== null) {
          p.next = p2;
        }
        return head.next;
      }
      function sort(keys, values, left, right, compare) {
        if (left >= right) return;
        var pivot = keys[(left + right) >> 1];
        var i = left - 1;
        var j = right + 1;
        while (true) {
          do i++;
          while (compare(keys[i], pivot) < 0);
          do j--;
          while (compare(keys[j], pivot) > 0);
          if (i >= j) break;
          var tmp = keys[i];
          keys[i] = keys[j];
          keys[j] = tmp;
          tmp = values[i];
          values[i] = values[j];
          values[j] = tmp;
        }
        sort(keys, values, left, j, compare);
        sort(keys, values, j + 1, right, compare);
      }
      const isInBbox = (bbox, point) => {
        return (
          bbox.ll.x <= point.x &&
          point.x <= bbox.ur.x &&
          bbox.ll.y <= point.y &&
          point.y <= bbox.ur.y
        );
      };
      const getBboxOverlap = (b1, b2) => {
        if (b2.ur.x < b1.ll.x || b1.ur.x < b2.ll.x || b2.ur.y < b1.ll.y || b1.ur.y < b2.ll.y)
          return null;
        const lowerX = b1.ll.x < b2.ll.x ? b2.ll.x : b1.ll.x;
        const upperX = b1.ur.x < b2.ur.x ? b1.ur.x : b2.ur.x;
        const lowerY = b1.ll.y < b2.ll.y ? b2.ll.y : b1.ll.y;
        const upperY = b1.ur.y < b2.ur.y ? b1.ur.y : b2.ur.y;
        return {
          ll: {
            x: lowerX,
            y: lowerY,
          },
          ur: {
            x: upperX,
            y: upperY,
          },
        };
      };
      let epsilon$1 = Number.EPSILON;
      if (epsilon$1 === void 0) epsilon$1 = Math.pow(2, -52);
      const EPSILON_SQ = epsilon$1 * epsilon$1;
      const cmp = (a, b) => {
        if (-epsilon$1 < a && a < epsilon$1) {
          if (-epsilon$1 < b && b < epsilon$1) {
            return 0;
          }
        }
        const ab = a - b;
        if (ab * ab < EPSILON_SQ * a * b) {
          return 0;
        }
        return a < b ? -1 : 1;
      };
      class PtRounder {
        constructor() {
          this.reset();
        }
        reset() {
          this.xRounder = new CoordRounder();
          this.yRounder = new CoordRounder();
        }
        round(x, y) {
          return {
            x: this.xRounder.round(x),
            y: this.yRounder.round(y),
          };
        }
      }
      class CoordRounder {
        constructor() {
          this.tree = new Tree();
          this.round(0);
        }
        // Note: this can rounds input values backwards or forwards.
        //       You might ask, why not restrict this to just rounding
        //       forwards? Wouldn't that allow left endpoints to always
        //       remain left endpoints during splitting (never change to
        //       right). No - it wouldn't, because we snap intersections
        //       to endpoints (to establish independence from the segment
        //       angle for t-intersections).
        round(coord) {
          const node = this.tree.add(coord);
          const prevNode = this.tree.prev(node);
          if (prevNode !== null && cmp(node.key, prevNode.key) === 0) {
            this.tree.remove(coord);
            return prevNode.key;
          }
          const nextNode = this.tree.next(node);
          if (nextNode !== null && cmp(node.key, nextNode.key) === 0) {
            this.tree.remove(coord);
            return nextNode.key;
          }
          return coord;
        }
      }
      const rounder = new PtRounder();
      const epsilon = 11102230246251565e-32;
      const splitter = 134217729;
      const resulterrbound = (3 + 8 * epsilon) * epsilon;
      function sum(elen, e, flen, f, h) {
        let Q, Qnew, hh, bvirt;
        let enow = e[0];
        let fnow = f[0];
        let eindex = 0;
        let findex = 0;
        if (fnow > enow === fnow > -enow) {
          Q = enow;
          enow = e[++eindex];
        } else {
          Q = fnow;
          fnow = f[++findex];
        }
        let hindex = 0;
        if (eindex < elen && findex < flen) {
          if (fnow > enow === fnow > -enow) {
            Qnew = enow + Q;
            hh = Q - (Qnew - enow);
            enow = e[++eindex];
          } else {
            Qnew = fnow + Q;
            hh = Q - (Qnew - fnow);
            fnow = f[++findex];
          }
          Q = Qnew;
          if (hh !== 0) {
            h[hindex++] = hh;
          }
          while (eindex < elen && findex < flen) {
            if (fnow > enow === fnow > -enow) {
              Qnew = Q + enow;
              bvirt = Qnew - Q;
              hh = Q - (Qnew - bvirt) + (enow - bvirt);
              enow = e[++eindex];
            } else {
              Qnew = Q + fnow;
              bvirt = Qnew - Q;
              hh = Q - (Qnew - bvirt) + (fnow - bvirt);
              fnow = f[++findex];
            }
            Q = Qnew;
            if (hh !== 0) {
              h[hindex++] = hh;
            }
          }
        }
        while (eindex < elen) {
          Qnew = Q + enow;
          bvirt = Qnew - Q;
          hh = Q - (Qnew - bvirt) + (enow - bvirt);
          enow = e[++eindex];
          Q = Qnew;
          if (hh !== 0) {
            h[hindex++] = hh;
          }
        }
        while (findex < flen) {
          Qnew = Q + fnow;
          bvirt = Qnew - Q;
          hh = Q - (Qnew - bvirt) + (fnow - bvirt);
          fnow = f[++findex];
          Q = Qnew;
          if (hh !== 0) {
            h[hindex++] = hh;
          }
        }
        if (Q !== 0 || hindex === 0) {
          h[hindex++] = Q;
        }
        return hindex;
      }
      function estimate(elen, e) {
        let Q = e[0];
        for (let i = 1; i < elen; i++) Q += e[i];
        return Q;
      }
      function vec(n) {
        return new Float64Array(n);
      }
      const ccwerrboundA = (3 + 16 * epsilon) * epsilon;
      const ccwerrboundB = (2 + 12 * epsilon) * epsilon;
      const ccwerrboundC = (9 + 64 * epsilon) * epsilon * epsilon;
      const B = vec(4);
      const C1 = vec(8);
      const C2 = vec(12);
      const D = vec(16);
      const u = vec(4);
      function orient2dadapt(ax, ay, bx, by, cx, cy, detsum) {
        let acxtail, acytail, bcxtail, bcytail;
        let bvirt, c, ahi, alo, bhi, blo, _i, _j, _0, s1, s0, t1, t0, u3;
        const acx = ax - cx;
        const bcx = bx - cx;
        const acy = ay - cy;
        const bcy = by - cy;
        s1 = acx * bcy;
        c = splitter * acx;
        ahi = c - (c - acx);
        alo = acx - ahi;
        c = splitter * bcy;
        bhi = c - (c - bcy);
        blo = bcy - bhi;
        s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
        t1 = acy * bcx;
        c = splitter * acy;
        ahi = c - (c - acy);
        alo = acy - ahi;
        c = splitter * bcx;
        bhi = c - (c - bcx);
        blo = bcx - bhi;
        t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
        _i = s0 - t0;
        bvirt = s0 - _i;
        B[0] = s0 - (_i + bvirt) + (bvirt - t0);
        _j = s1 + _i;
        bvirt = _j - s1;
        _0 = s1 - (_j - bvirt) + (_i - bvirt);
        _i = _0 - t1;
        bvirt = _0 - _i;
        B[1] = _0 - (_i + bvirt) + (bvirt - t1);
        u3 = _j + _i;
        bvirt = u3 - _j;
        B[2] = _j - (u3 - bvirt) + (_i - bvirt);
        B[3] = u3;
        let det = estimate(4, B);
        let errbound = ccwerrboundB * detsum;
        if (det >= errbound || -det >= errbound) {
          return det;
        }
        bvirt = ax - acx;
        acxtail = ax - (acx + bvirt) + (bvirt - cx);
        bvirt = bx - bcx;
        bcxtail = bx - (bcx + bvirt) + (bvirt - cx);
        bvirt = ay - acy;
        acytail = ay - (acy + bvirt) + (bvirt - cy);
        bvirt = by - bcy;
        bcytail = by - (bcy + bvirt) + (bvirt - cy);
        if (acxtail === 0 && acytail === 0 && bcxtail === 0 && bcytail === 0) {
          return det;
        }
        errbound = ccwerrboundC * detsum + resulterrbound * Math.abs(det);
        det += acx * bcytail + bcy * acxtail - (acy * bcxtail + bcx * acytail);
        if (det >= errbound || -det >= errbound) return det;
        s1 = acxtail * bcy;
        c = splitter * acxtail;
        ahi = c - (c - acxtail);
        alo = acxtail - ahi;
        c = splitter * bcy;
        bhi = c - (c - bcy);
        blo = bcy - bhi;
        s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
        t1 = acytail * bcx;
        c = splitter * acytail;
        ahi = c - (c - acytail);
        alo = acytail - ahi;
        c = splitter * bcx;
        bhi = c - (c - bcx);
        blo = bcx - bhi;
        t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
        _i = s0 - t0;
        bvirt = s0 - _i;
        u[0] = s0 - (_i + bvirt) + (bvirt - t0);
        _j = s1 + _i;
        bvirt = _j - s1;
        _0 = s1 - (_j - bvirt) + (_i - bvirt);
        _i = _0 - t1;
        bvirt = _0 - _i;
        u[1] = _0 - (_i + bvirt) + (bvirt - t1);
        u3 = _j + _i;
        bvirt = u3 - _j;
        u[2] = _j - (u3 - bvirt) + (_i - bvirt);
        u[3] = u3;
        const C1len = sum(4, B, 4, u, C1);
        s1 = acx * bcytail;
        c = splitter * acx;
        ahi = c - (c - acx);
        alo = acx - ahi;
        c = splitter * bcytail;
        bhi = c - (c - bcytail);
        blo = bcytail - bhi;
        s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
        t1 = acy * bcxtail;
        c = splitter * acy;
        ahi = c - (c - acy);
        alo = acy - ahi;
        c = splitter * bcxtail;
        bhi = c - (c - bcxtail);
        blo = bcxtail - bhi;
        t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
        _i = s0 - t0;
        bvirt = s0 - _i;
        u[0] = s0 - (_i + bvirt) + (bvirt - t0);
        _j = s1 + _i;
        bvirt = _j - s1;
        _0 = s1 - (_j - bvirt) + (_i - bvirt);
        _i = _0 - t1;
        bvirt = _0 - _i;
        u[1] = _0 - (_i + bvirt) + (bvirt - t1);
        u3 = _j + _i;
        bvirt = u3 - _j;
        u[2] = _j - (u3 - bvirt) + (_i - bvirt);
        u[3] = u3;
        const C2len = sum(C1len, C1, 4, u, C2);
        s1 = acxtail * bcytail;
        c = splitter * acxtail;
        ahi = c - (c - acxtail);
        alo = acxtail - ahi;
        c = splitter * bcytail;
        bhi = c - (c - bcytail);
        blo = bcytail - bhi;
        s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
        t1 = acytail * bcxtail;
        c = splitter * acytail;
        ahi = c - (c - acytail);
        alo = acytail - ahi;
        c = splitter * bcxtail;
        bhi = c - (c - bcxtail);
        blo = bcxtail - bhi;
        t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
        _i = s0 - t0;
        bvirt = s0 - _i;
        u[0] = s0 - (_i + bvirt) + (bvirt - t0);
        _j = s1 + _i;
        bvirt = _j - s1;
        _0 = s1 - (_j - bvirt) + (_i - bvirt);
        _i = _0 - t1;
        bvirt = _0 - _i;
        u[1] = _0 - (_i + bvirt) + (bvirt - t1);
        u3 = _j + _i;
        bvirt = u3 - _j;
        u[2] = _j - (u3 - bvirt) + (_i - bvirt);
        u[3] = u3;
        const Dlen = sum(C2len, C2, 4, u, D);
        return D[Dlen - 1];
      }
      function orient2d(ax, ay, bx, by, cx, cy) {
        const detleft = (ay - cy) * (bx - cx);
        const detright = (ax - cx) * (by - cy);
        const det = detleft - detright;
        const detsum = Math.abs(detleft + detright);
        if (Math.abs(det) >= ccwerrboundA * detsum) return det;
        return -orient2dadapt(ax, ay, bx, by, cx, cy, detsum);
      }
      const crossProduct = (a, b) => a.x * b.y - a.y * b.x;
      const dotProduct = (a, b) => a.x * b.x + a.y * b.y;
      const compareVectorAngles = (basePt, endPt1, endPt2) => {
        const res = orient2d(basePt.x, basePt.y, endPt1.x, endPt1.y, endPt2.x, endPt2.y);
        if (res > 0) return -1;
        if (res < 0) return 1;
        return 0;
      };
      const length = (v) => Math.sqrt(dotProduct(v, v));
      const sineOfAngle = (pShared, pBase, pAngle) => {
        const vBase = {
          x: pBase.x - pShared.x,
          y: pBase.y - pShared.y,
        };
        const vAngle = {
          x: pAngle.x - pShared.x,
          y: pAngle.y - pShared.y,
        };
        return crossProduct(vAngle, vBase) / length(vAngle) / length(vBase);
      };
      const cosineOfAngle = (pShared, pBase, pAngle) => {
        const vBase = {
          x: pBase.x - pShared.x,
          y: pBase.y - pShared.y,
        };
        const vAngle = {
          x: pAngle.x - pShared.x,
          y: pAngle.y - pShared.y,
        };
        return dotProduct(vAngle, vBase) / length(vAngle) / length(vBase);
      };
      const horizontalIntersection = (pt, v, y) => {
        if (v.y === 0) return null;
        return {
          x: pt.x + (v.x / v.y) * (y - pt.y),
          y,
        };
      };
      const verticalIntersection = (pt, v, x) => {
        if (v.x === 0) return null;
        return {
          x,
          y: pt.y + (v.y / v.x) * (x - pt.x),
        };
      };
      const intersection$1 = (pt1, v1, pt2, v2) => {
        if (v1.x === 0) return verticalIntersection(pt2, v2, pt1.x);
        if (v2.x === 0) return verticalIntersection(pt1, v1, pt2.x);
        if (v1.y === 0) return horizontalIntersection(pt2, v2, pt1.y);
        if (v2.y === 0) return horizontalIntersection(pt1, v1, pt2.y);
        const kross = crossProduct(v1, v2);
        if (kross == 0) return null;
        const ve = {
          x: pt2.x - pt1.x,
          y: pt2.y - pt1.y,
        };
        const d1 = crossProduct(ve, v1) / kross;
        const d2 = crossProduct(ve, v2) / kross;
        const x1 = pt1.x + d2 * v1.x,
          x2 = pt2.x + d1 * v2.x;
        const y1 = pt1.y + d2 * v1.y,
          y2 = pt2.y + d1 * v2.y;
        const x = (x1 + x2) / 2;
        const y = (y1 + y2) / 2;
        return {
          x,
          y,
        };
      };
      class SweepEvent {
        // for ordering sweep events in the sweep event queue
        static compare(a, b) {
          const ptCmp = SweepEvent.comparePoints(a.point, b.point);
          if (ptCmp !== 0) return ptCmp;
          if (a.point !== b.point) a.link(b);
          if (a.isLeft !== b.isLeft) return a.isLeft ? 1 : -1;
          return Segment.compare(a.segment, b.segment);
        }
        // for ordering points in sweep line order
        static comparePoints(aPt, bPt) {
          if (aPt.x < bPt.x) return -1;
          if (aPt.x > bPt.x) return 1;
          if (aPt.y < bPt.y) return -1;
          if (aPt.y > bPt.y) return 1;
          return 0;
        }
        // Warning: 'point' input will be modified and re-used (for performance)
        constructor(point, isLeft) {
          if (point.events === void 0) point.events = [this];
          else point.events.push(this);
          this.point = point;
          this.isLeft = isLeft;
        }
        link(other) {
          if (other.point === this.point) {
            throw new Error('Tried to link already linked events');
          }
          const otherEvents = other.point.events;
          for (let i = 0, iMax = otherEvents.length; i < iMax; i++) {
            const evt = otherEvents[i];
            this.point.events.push(evt);
            evt.point = this.point;
          }
          this.checkForConsuming();
        }
        /* Do a pass over our linked events and check to see if any pair
         * of segments match, and should be consumed. */
        checkForConsuming() {
          const numEvents = this.point.events.length;
          for (let i = 0; i < numEvents; i++) {
            const evt1 = this.point.events[i];
            if (evt1.segment.consumedBy !== void 0) continue;
            for (let j = i + 1; j < numEvents; j++) {
              const evt2 = this.point.events[j];
              if (evt2.consumedBy !== void 0) continue;
              if (evt1.otherSE.point.events !== evt2.otherSE.point.events) continue;
              evt1.segment.consume(evt2.segment);
            }
          }
        }
        getAvailableLinkedEvents() {
          const events = [];
          for (let i = 0, iMax = this.point.events.length; i < iMax; i++) {
            const evt = this.point.events[i];
            if (evt !== this && !evt.segment.ringOut && evt.segment.isInResult()) {
              events.push(evt);
            }
          }
          return events;
        }
        /**
         * Returns a comparator function for sorting linked events that will
         * favor the event that will give us the smallest left-side angle.
         * All ring construction starts as low as possible heading to the right,
         * so by always turning left as sharp as possible we'll get polygons
         * without uncessary loops & holes.
         *
         * The comparator function has a compute cache such that it avoids
         * re-computing already-computed values.
         */
        getLeftmostComparator(baseEvent) {
          const cache = /* @__PURE__ */ new Map();
          const fillCache = (linkedEvent) => {
            const nextEvent = linkedEvent.otherSE;
            cache.set(linkedEvent, {
              sine: sineOfAngle(this.point, baseEvent.point, nextEvent.point),
              cosine: cosineOfAngle(this.point, baseEvent.point, nextEvent.point),
            });
          };
          return (a, b) => {
            if (!cache.has(a)) fillCache(a);
            if (!cache.has(b)) fillCache(b);
            const { sine: asine, cosine: acosine } = cache.get(a);
            const { sine: bsine, cosine: bcosine } = cache.get(b);
            if (asine >= 0 && bsine >= 0) {
              if (acosine < bcosine) return 1;
              if (acosine > bcosine) return -1;
              return 0;
            }
            if (asine < 0 && bsine < 0) {
              if (acosine < bcosine) return -1;
              if (acosine > bcosine) return 1;
              return 0;
            }
            if (bsine < asine) return -1;
            if (bsine > asine) return 1;
            return 0;
          };
        }
      }
      let segmentId = 0;
      class Segment {
        /* This compare() function is for ordering segments in the sweep
         * line tree, and does so according to the following criteria:
         *
         * Consider the vertical line that lies an infinestimal step to the
         * right of the right-more of the two left endpoints of the input
         * segments. Imagine slowly moving a point up from negative infinity
         * in the increasing y direction. Which of the two segments will that
         * point intersect first? That segment comes 'before' the other one.
         *
         * If neither segment would be intersected by such a line, (if one
         * or more of the segments are vertical) then the line to be considered
         * is directly on the right-more of the two left inputs.
         */
        static compare(a, b) {
          const alx = a.leftSE.point.x;
          const blx = b.leftSE.point.x;
          const arx = a.rightSE.point.x;
          const brx = b.rightSE.point.x;
          if (brx < alx) return 1;
          if (arx < blx) return -1;
          const aly = a.leftSE.point.y;
          const bly = b.leftSE.point.y;
          const ary = a.rightSE.point.y;
          const bry = b.rightSE.point.y;
          if (alx < blx) {
            if (bly < aly && bly < ary) return 1;
            if (bly > aly && bly > ary) return -1;
            const aCmpBLeft = a.comparePoint(b.leftSE.point);
            if (aCmpBLeft < 0) return 1;
            if (aCmpBLeft > 0) return -1;
            const bCmpARight = b.comparePoint(a.rightSE.point);
            if (bCmpARight !== 0) return bCmpARight;
            return -1;
          }
          if (alx > blx) {
            if (aly < bly && aly < bry) return -1;
            if (aly > bly && aly > bry) return 1;
            const bCmpALeft = b.comparePoint(a.leftSE.point);
            if (bCmpALeft !== 0) return bCmpALeft;
            const aCmpBRight = a.comparePoint(b.rightSE.point);
            if (aCmpBRight < 0) return 1;
            if (aCmpBRight > 0) return -1;
            return 1;
          }
          if (aly < bly) return -1;
          if (aly > bly) return 1;
          if (arx < brx) {
            const bCmpARight = b.comparePoint(a.rightSE.point);
            if (bCmpARight !== 0) return bCmpARight;
          }
          if (arx > brx) {
            const aCmpBRight = a.comparePoint(b.rightSE.point);
            if (aCmpBRight < 0) return 1;
            if (aCmpBRight > 0) return -1;
          }
          if (arx !== brx) {
            const ay = ary - aly;
            const ax = arx - alx;
            const by = bry - bly;
            const bx = brx - blx;
            if (ay > ax && by < bx) return 1;
            if (ay < ax && by > bx) return -1;
          }
          if (arx > brx) return 1;
          if (arx < brx) return -1;
          if (ary < bry) return -1;
          if (ary > bry) return 1;
          if (a.id < b.id) return -1;
          if (a.id > b.id) return 1;
          return 0;
        }
        /* Warning: a reference to ringWindings input will be stored,
         *  and possibly will be later modified */
        constructor(leftSE, rightSE, rings, windings) {
          this.id = ++segmentId;
          this.leftSE = leftSE;
          leftSE.segment = this;
          leftSE.otherSE = rightSE;
          this.rightSE = rightSE;
          rightSE.segment = this;
          rightSE.otherSE = leftSE;
          this.rings = rings;
          this.windings = windings;
        }
        static fromRing(pt1, pt2, ring) {
          let leftPt, rightPt, winding;
          const cmpPts = SweepEvent.comparePoints(pt1, pt2);
          if (cmpPts < 0) {
            leftPt = pt1;
            rightPt = pt2;
            winding = 1;
          } else if (cmpPts > 0) {
            leftPt = pt2;
            rightPt = pt1;
            winding = -1;
          } else throw new Error(`Tried to create degenerate segment at [${pt1.x}, ${pt1.y}]`);
          const leftSE = new SweepEvent(leftPt, true);
          const rightSE = new SweepEvent(rightPt, false);
          return new Segment(leftSE, rightSE, [ring], [winding]);
        }
        /* When a segment is split, the rightSE is replaced with a new sweep event */
        replaceRightSE(newRightSE) {
          this.rightSE = newRightSE;
          this.rightSE.segment = this;
          this.rightSE.otherSE = this.leftSE;
          this.leftSE.otherSE = this.rightSE;
        }
        bbox() {
          const y1 = this.leftSE.point.y;
          const y2 = this.rightSE.point.y;
          return {
            ll: {
              x: this.leftSE.point.x,
              y: y1 < y2 ? y1 : y2,
            },
            ur: {
              x: this.rightSE.point.x,
              y: y1 > y2 ? y1 : y2,
            },
          };
        }
        /* A vector from the left point to the right */
        vector() {
          return {
            x: this.rightSE.point.x - this.leftSE.point.x,
            y: this.rightSE.point.y - this.leftSE.point.y,
          };
        }
        isAnEndpoint(pt) {
          return (
            (pt.x === this.leftSE.point.x && pt.y === this.leftSE.point.y) ||
            (pt.x === this.rightSE.point.x && pt.y === this.rightSE.point.y)
          );
        }
        /* Compare this segment with a point.
         *
         * A point P is considered to be colinear to a segment if there
         * exists a distance D such that if we travel along the segment
         * from one * endpoint towards the other a distance D, we find
         * ourselves at point P.
         *
         * Return value indicates:
         *
         *   1: point lies above the segment (to the left of vertical)
         *   0: point is colinear to segment
         *  -1: point lies below the segment (to the right of vertical)
         */
        comparePoint(point) {
          if (this.isAnEndpoint(point)) return 0;
          const lPt = this.leftSE.point;
          const rPt = this.rightSE.point;
          const v = this.vector();
          if (lPt.x === rPt.x) {
            if (point.x === lPt.x) return 0;
            return point.x < lPt.x ? 1 : -1;
          }
          const yDist = (point.y - lPt.y) / v.y;
          const xFromYDist = lPt.x + yDist * v.x;
          if (point.x === xFromYDist) return 0;
          const xDist = (point.x - lPt.x) / v.x;
          const yFromXDist = lPt.y + xDist * v.y;
          if (point.y === yFromXDist) return 0;
          return point.y < yFromXDist ? -1 : 1;
        }
        /**
         * Given another segment, returns the first non-trivial intersection
         * between the two segments (in terms of sweep line ordering), if it exists.
         *
         * A 'non-trivial' intersection is one that will cause one or both of the
         * segments to be split(). As such, 'trivial' vs. 'non-trivial' intersection:
         *
         *   * endpoint of segA with endpoint of segB --> trivial
         *   * endpoint of segA with point along segB --> non-trivial
         *   * endpoint of segB with point along segA --> non-trivial
         *   * point along segA with point along segB --> non-trivial
         *
         * If no non-trivial intersection exists, return null
         * Else, return null.
         */
        getIntersection(other) {
          const tBbox = this.bbox();
          const oBbox = other.bbox();
          const bboxOverlap = getBboxOverlap(tBbox, oBbox);
          if (bboxOverlap === null) return null;
          const tlp = this.leftSE.point;
          const trp = this.rightSE.point;
          const olp = other.leftSE.point;
          const orp = other.rightSE.point;
          const touchesOtherLSE = isInBbox(tBbox, olp) && this.comparePoint(olp) === 0;
          const touchesThisLSE = isInBbox(oBbox, tlp) && other.comparePoint(tlp) === 0;
          const touchesOtherRSE = isInBbox(tBbox, orp) && this.comparePoint(orp) === 0;
          const touchesThisRSE = isInBbox(oBbox, trp) && other.comparePoint(trp) === 0;
          if (touchesThisLSE && touchesOtherLSE) {
            if (touchesThisRSE && !touchesOtherRSE) return trp;
            if (!touchesThisRSE && touchesOtherRSE) return orp;
            return null;
          }
          if (touchesThisLSE) {
            if (touchesOtherRSE) {
              if (tlp.x === orp.x && tlp.y === orp.y) return null;
            }
            return tlp;
          }
          if (touchesOtherLSE) {
            if (touchesThisRSE) {
              if (trp.x === olp.x && trp.y === olp.y) return null;
            }
            return olp;
          }
          if (touchesThisRSE && touchesOtherRSE) return null;
          if (touchesThisRSE) return trp;
          if (touchesOtherRSE) return orp;
          const pt = intersection$1(tlp, this.vector(), olp, other.vector());
          if (pt === null) return null;
          if (!isInBbox(bboxOverlap, pt)) return null;
          return rounder.round(pt.x, pt.y);
        }
        /**
         * Split the given segment into multiple segments on the given points.
         *  * Each existing segment will retain its leftSE and a new rightSE will be
         *    generated for it.
         *  * A new segment will be generated which will adopt the original segment's
         *    rightSE, and a new leftSE will be generated for it.
         *  * If there are more than two points given to split on, new segments
         *    in the middle will be generated with new leftSE and rightSE's.
         *  * An array of the newly generated SweepEvents will be returned.
         *
         * Warning: input array of points is modified
         */
        split(point) {
          const newEvents = [];
          const alreadyLinked = point.events !== void 0;
          const newLeftSE = new SweepEvent(point, true);
          const newRightSE = new SweepEvent(point, false);
          const oldRightSE = this.rightSE;
          this.replaceRightSE(newRightSE);
          newEvents.push(newRightSE);
          newEvents.push(newLeftSE);
          const newSeg = new Segment(
            newLeftSE,
            oldRightSE,
            this.rings.slice(),
            this.windings.slice(),
          );
          if (SweepEvent.comparePoints(newSeg.leftSE.point, newSeg.rightSE.point) > 0) {
            newSeg.swapEvents();
          }
          if (SweepEvent.comparePoints(this.leftSE.point, this.rightSE.point) > 0) {
            this.swapEvents();
          }
          if (alreadyLinked) {
            newLeftSE.checkForConsuming();
            newRightSE.checkForConsuming();
          }
          return newEvents;
        }
        /* Swap which event is left and right */
        swapEvents() {
          const tmpEvt = this.rightSE;
          this.rightSE = this.leftSE;
          this.leftSE = tmpEvt;
          this.leftSE.isLeft = true;
          this.rightSE.isLeft = false;
          for (let i = 0, iMax = this.windings.length; i < iMax; i++) {
            this.windings[i] *= -1;
          }
        }
        /* Consume another segment. We take their rings under our wing
         * and mark them as consumed. Use for perfectly overlapping segments */
        consume(other) {
          let consumer = this;
          let consumee = other;
          while (consumer.consumedBy) consumer = consumer.consumedBy;
          while (consumee.consumedBy) consumee = consumee.consumedBy;
          const cmp2 = Segment.compare(consumer, consumee);
          if (cmp2 === 0) return;
          if (cmp2 > 0) {
            const tmp = consumer;
            consumer = consumee;
            consumee = tmp;
          }
          if (consumer.prev === consumee) {
            const tmp = consumer;
            consumer = consumee;
            consumee = tmp;
          }
          for (let i = 0, iMax = consumee.rings.length; i < iMax; i++) {
            const ring = consumee.rings[i];
            const winding = consumee.windings[i];
            const index2 = consumer.rings.indexOf(ring);
            if (index2 === -1) {
              consumer.rings.push(ring);
              consumer.windings.push(winding);
            } else consumer.windings[index2] += winding;
          }
          consumee.rings = null;
          consumee.windings = null;
          consumee.consumedBy = consumer;
          consumee.leftSE.consumedBy = consumer.leftSE;
          consumee.rightSE.consumedBy = consumer.rightSE;
        }
        /* The first segment previous segment chain that is in the result */
        prevInResult() {
          if (this._prevInResult !== void 0) return this._prevInResult;
          if (!this.prev) this._prevInResult = null;
          else if (this.prev.isInResult()) this._prevInResult = this.prev;
          else this._prevInResult = this.prev.prevInResult();
          return this._prevInResult;
        }
        beforeState() {
          if (this._beforeState !== void 0) return this._beforeState;
          if (!this.prev)
            this._beforeState = {
              rings: [],
              windings: [],
              multiPolys: [],
            };
          else {
            const seg = this.prev.consumedBy || this.prev;
            this._beforeState = seg.afterState();
          }
          return this._beforeState;
        }
        afterState() {
          if (this._afterState !== void 0) return this._afterState;
          const beforeState = this.beforeState();
          this._afterState = {
            rings: beforeState.rings.slice(0),
            windings: beforeState.windings.slice(0),
            multiPolys: [],
          };
          const ringsAfter = this._afterState.rings;
          const windingsAfter = this._afterState.windings;
          const mpsAfter = this._afterState.multiPolys;
          for (let i = 0, iMax = this.rings.length; i < iMax; i++) {
            const ring = this.rings[i];
            const winding = this.windings[i];
            const index2 = ringsAfter.indexOf(ring);
            if (index2 === -1) {
              ringsAfter.push(ring);
              windingsAfter.push(winding);
            } else windingsAfter[index2] += winding;
          }
          const polysAfter = [];
          const polysExclude = [];
          for (let i = 0, iMax = ringsAfter.length; i < iMax; i++) {
            if (windingsAfter[i] === 0) continue;
            const ring = ringsAfter[i];
            const poly = ring.poly;
            if (polysExclude.indexOf(poly) !== -1) continue;
            if (ring.isExterior) polysAfter.push(poly);
            else {
              if (polysExclude.indexOf(poly) === -1) polysExclude.push(poly);
              const index2 = polysAfter.indexOf(ring.poly);
              if (index2 !== -1) polysAfter.splice(index2, 1);
            }
          }
          for (let i = 0, iMax = polysAfter.length; i < iMax; i++) {
            const mp = polysAfter[i].multiPoly;
            if (mpsAfter.indexOf(mp) === -1) mpsAfter.push(mp);
          }
          return this._afterState;
        }
        /* Is this segment part of the final result? */
        isInResult() {
          if (this.consumedBy) return false;
          if (this._isInResult !== void 0) return this._isInResult;
          const mpsBefore = this.beforeState().multiPolys;
          const mpsAfter = this.afterState().multiPolys;
          switch (operation.type) {
            case 'union': {
              const noBefores = mpsBefore.length === 0;
              const noAfters = mpsAfter.length === 0;
              this._isInResult = noBefores !== noAfters;
              break;
            }
            case 'intersection': {
              let least;
              let most;
              if (mpsBefore.length < mpsAfter.length) {
                least = mpsBefore.length;
                most = mpsAfter.length;
              } else {
                least = mpsAfter.length;
                most = mpsBefore.length;
              }
              this._isInResult = most === operation.numMultiPolys && least < most;
              break;
            }
            case 'xor': {
              const diff = Math.abs(mpsBefore.length - mpsAfter.length);
              this._isInResult = diff % 2 === 1;
              break;
            }
            case 'difference': {
              const isJustSubject = (mps) => mps.length === 1 && mps[0].isSubject;
              this._isInResult = isJustSubject(mpsBefore) !== isJustSubject(mpsAfter);
              break;
            }
            default:
              throw new Error(`Unrecognized operation type found ${operation.type}`);
          }
          return this._isInResult;
        }
      }
      class RingIn {
        constructor(geomRing, poly, isExterior) {
          if (!Array.isArray(geomRing) || geomRing.length === 0) {
            throw new Error('Input geometry is not a valid Polygon or MultiPolygon');
          }
          this.poly = poly;
          this.isExterior = isExterior;
          this.segments = [];
          if (typeof geomRing[0][0] !== 'number' || typeof geomRing[0][1] !== 'number') {
            throw new Error('Input geometry is not a valid Polygon or MultiPolygon');
          }
          const firstPoint = rounder.round(geomRing[0][0], geomRing[0][1]);
          this.bbox = {
            ll: {
              x: firstPoint.x,
              y: firstPoint.y,
            },
            ur: {
              x: firstPoint.x,
              y: firstPoint.y,
            },
          };
          let prevPoint = firstPoint;
          for (let i = 1, iMax = geomRing.length; i < iMax; i++) {
            if (typeof geomRing[i][0] !== 'number' || typeof geomRing[i][1] !== 'number') {
              throw new Error('Input geometry is not a valid Polygon or MultiPolygon');
            }
            let point = rounder.round(geomRing[i][0], geomRing[i][1]);
            if (point.x === prevPoint.x && point.y === prevPoint.y) continue;
            this.segments.push(Segment.fromRing(prevPoint, point, this));
            if (point.x < this.bbox.ll.x) this.bbox.ll.x = point.x;
            if (point.y < this.bbox.ll.y) this.bbox.ll.y = point.y;
            if (point.x > this.bbox.ur.x) this.bbox.ur.x = point.x;
            if (point.y > this.bbox.ur.y) this.bbox.ur.y = point.y;
            prevPoint = point;
          }
          if (firstPoint.x !== prevPoint.x || firstPoint.y !== prevPoint.y) {
            this.segments.push(Segment.fromRing(prevPoint, firstPoint, this));
          }
        }
        getSweepEvents() {
          const sweepEvents = [];
          for (let i = 0, iMax = this.segments.length; i < iMax; i++) {
            const segment = this.segments[i];
            sweepEvents.push(segment.leftSE);
            sweepEvents.push(segment.rightSE);
          }
          return sweepEvents;
        }
      }
      class PolyIn {
        constructor(geomPoly, multiPoly) {
          if (!Array.isArray(geomPoly)) {
            throw new Error('Input geometry is not a valid Polygon or MultiPolygon');
          }
          this.exteriorRing = new RingIn(geomPoly[0], this, true);
          this.bbox = {
            ll: {
              x: this.exteriorRing.bbox.ll.x,
              y: this.exteriorRing.bbox.ll.y,
            },
            ur: {
              x: this.exteriorRing.bbox.ur.x,
              y: this.exteriorRing.bbox.ur.y,
            },
          };
          this.interiorRings = [];
          for (let i = 1, iMax = geomPoly.length; i < iMax; i++) {
            const ring = new RingIn(geomPoly[i], this, false);
            if (ring.bbox.ll.x < this.bbox.ll.x) this.bbox.ll.x = ring.bbox.ll.x;
            if (ring.bbox.ll.y < this.bbox.ll.y) this.bbox.ll.y = ring.bbox.ll.y;
            if (ring.bbox.ur.x > this.bbox.ur.x) this.bbox.ur.x = ring.bbox.ur.x;
            if (ring.bbox.ur.y > this.bbox.ur.y) this.bbox.ur.y = ring.bbox.ur.y;
            this.interiorRings.push(ring);
          }
          this.multiPoly = multiPoly;
        }
        getSweepEvents() {
          const sweepEvents = this.exteriorRing.getSweepEvents();
          for (let i = 0, iMax = this.interiorRings.length; i < iMax; i++) {
            const ringSweepEvents = this.interiorRings[i].getSweepEvents();
            for (let j = 0, jMax = ringSweepEvents.length; j < jMax; j++) {
              sweepEvents.push(ringSweepEvents[j]);
            }
          }
          return sweepEvents;
        }
      }
      class MultiPolyIn {
        constructor(geom, isSubject) {
          if (!Array.isArray(geom)) {
            throw new Error('Input geometry is not a valid Polygon or MultiPolygon');
          }
          try {
            if (typeof geom[0][0][0] === 'number') geom = [geom];
          } catch (ex) {}
          this.polys = [];
          this.bbox = {
            ll: {
              x: Number.POSITIVE_INFINITY,
              y: Number.POSITIVE_INFINITY,
            },
            ur: {
              x: Number.NEGATIVE_INFINITY,
              y: Number.NEGATIVE_INFINITY,
            },
          };
          for (let i = 0, iMax = geom.length; i < iMax; i++) {
            const poly = new PolyIn(geom[i], this);
            if (poly.bbox.ll.x < this.bbox.ll.x) this.bbox.ll.x = poly.bbox.ll.x;
            if (poly.bbox.ll.y < this.bbox.ll.y) this.bbox.ll.y = poly.bbox.ll.y;
            if (poly.bbox.ur.x > this.bbox.ur.x) this.bbox.ur.x = poly.bbox.ur.x;
            if (poly.bbox.ur.y > this.bbox.ur.y) this.bbox.ur.y = poly.bbox.ur.y;
            this.polys.push(poly);
          }
          this.isSubject = isSubject;
        }
        getSweepEvents() {
          const sweepEvents = [];
          for (let i = 0, iMax = this.polys.length; i < iMax; i++) {
            const polySweepEvents = this.polys[i].getSweepEvents();
            for (let j = 0, jMax = polySweepEvents.length; j < jMax; j++) {
              sweepEvents.push(polySweepEvents[j]);
            }
          }
          return sweepEvents;
        }
      }
      class RingOut {
        /* Given the segments from the sweep line pass, compute & return a series
         * of closed rings from all the segments marked to be part of the result */
        static factory(allSegments) {
          const ringsOut = [];
          for (let i = 0, iMax = allSegments.length; i < iMax; i++) {
            const segment = allSegments[i];
            if (!segment.isInResult() || segment.ringOut) continue;
            let prevEvent = null;
            let event = segment.leftSE;
            let nextEvent = segment.rightSE;
            const events = [event];
            const startingPoint = event.point;
            const intersectionLEs = [];
            while (true) {
              prevEvent = event;
              event = nextEvent;
              events.push(event);
              if (event.point === startingPoint) break;
              while (true) {
                const availableLEs = event.getAvailableLinkedEvents();
                if (availableLEs.length === 0) {
                  const firstPt = events[0].point;
                  const lastPt = events[events.length - 1].point;
                  throw new Error(
                    `Unable to complete output ring starting at [${firstPt.x}, ${firstPt.y}]. Last matching segment found ends at [${lastPt.x}, ${lastPt.y}].`,
                  );
                }
                if (availableLEs.length === 1) {
                  nextEvent = availableLEs[0].otherSE;
                  break;
                }
                let indexLE = null;
                for (let j = 0, jMax = intersectionLEs.length; j < jMax; j++) {
                  if (intersectionLEs[j].point === event.point) {
                    indexLE = j;
                    break;
                  }
                }
                if (indexLE !== null) {
                  const intersectionLE = intersectionLEs.splice(indexLE)[0];
                  const ringEvents = events.splice(intersectionLE.index);
                  ringEvents.unshift(ringEvents[0].otherSE);
                  ringsOut.push(new RingOut(ringEvents.reverse()));
                  continue;
                }
                intersectionLEs.push({
                  index: events.length,
                  point: event.point,
                });
                const comparator = event.getLeftmostComparator(prevEvent);
                nextEvent = availableLEs.sort(comparator)[0].otherSE;
                break;
              }
            }
            ringsOut.push(new RingOut(events));
          }
          return ringsOut;
        }
        constructor(events) {
          this.events = events;
          for (let i = 0, iMax = events.length; i < iMax; i++) {
            events[i].segment.ringOut = this;
          }
          this.poly = null;
        }
        getGeom() {
          let prevPt = this.events[0].point;
          const points = [prevPt];
          for (let i = 1, iMax = this.events.length - 1; i < iMax; i++) {
            const pt2 = this.events[i].point;
            const nextPt2 = this.events[i + 1].point;
            if (compareVectorAngles(pt2, prevPt, nextPt2) === 0) continue;
            points.push(pt2);
            prevPt = pt2;
          }
          if (points.length === 1) return null;
          const pt = points[0];
          const nextPt = points[1];
          if (compareVectorAngles(pt, prevPt, nextPt) === 0) points.shift();
          points.push(points[0]);
          const step = this.isExteriorRing() ? 1 : -1;
          const iStart = this.isExteriorRing() ? 0 : points.length - 1;
          const iEnd = this.isExteriorRing() ? points.length : -1;
          const orderedPoints = [];
          for (let i = iStart; i != iEnd; i += step) orderedPoints.push([points[i].x, points[i].y]);
          return orderedPoints;
        }
        isExteriorRing() {
          if (this._isExteriorRing === void 0) {
            const enclosing = this.enclosingRing();
            this._isExteriorRing = enclosing ? !enclosing.isExteriorRing() : true;
          }
          return this._isExteriorRing;
        }
        enclosingRing() {
          if (this._enclosingRing === void 0) {
            this._enclosingRing = this._calcEnclosingRing();
          }
          return this._enclosingRing;
        }
        /* Returns the ring that encloses this one, if any */
        _calcEnclosingRing() {
          let leftMostEvt = this.events[0];
          for (let i = 1, iMax = this.events.length; i < iMax; i++) {
            const evt = this.events[i];
            if (SweepEvent.compare(leftMostEvt, evt) > 0) leftMostEvt = evt;
          }
          let prevSeg = leftMostEvt.segment.prevInResult();
          let prevPrevSeg = prevSeg ? prevSeg.prevInResult() : null;
          while (true) {
            if (!prevSeg) return null;
            if (!prevPrevSeg) return prevSeg.ringOut;
            if (prevPrevSeg.ringOut !== prevSeg.ringOut) {
              if (prevPrevSeg.ringOut.enclosingRing() !== prevSeg.ringOut) {
                return prevSeg.ringOut;
              } else return prevSeg.ringOut.enclosingRing();
            }
            prevSeg = prevPrevSeg.prevInResult();
            prevPrevSeg = prevSeg ? prevSeg.prevInResult() : null;
          }
        }
      }
      class PolyOut {
        constructor(exteriorRing) {
          this.exteriorRing = exteriorRing;
          exteriorRing.poly = this;
          this.interiorRings = [];
        }
        addInterior(ring) {
          this.interiorRings.push(ring);
          ring.poly = this;
        }
        getGeom() {
          const geom = [this.exteriorRing.getGeom()];
          if (geom[0] === null) return null;
          for (let i = 0, iMax = this.interiorRings.length; i < iMax; i++) {
            const ringGeom = this.interiorRings[i].getGeom();
            if (ringGeom === null) continue;
            geom.push(ringGeom);
          }
          return geom;
        }
      }
      class MultiPolyOut {
        constructor(rings) {
          this.rings = rings;
          this.polys = this._composePolys(rings);
        }
        getGeom() {
          const geom = [];
          for (let i = 0, iMax = this.polys.length; i < iMax; i++) {
            const polyGeom = this.polys[i].getGeom();
            if (polyGeom === null) continue;
            geom.push(polyGeom);
          }
          return geom;
        }
        _composePolys(rings) {
          const polys = [];
          for (let i = 0, iMax = rings.length; i < iMax; i++) {
            const ring = rings[i];
            if (ring.poly) continue;
            if (ring.isExteriorRing()) polys.push(new PolyOut(ring));
            else {
              const enclosingRing = ring.enclosingRing();
              if (!enclosingRing.poly) polys.push(new PolyOut(enclosingRing));
              enclosingRing.poly.addInterior(ring);
            }
          }
          return polys;
        }
      }
      class SweepLine {
        constructor(queue) {
          let comparator =
            arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : Segment.compare;
          this.queue = queue;
          this.tree = new Tree(comparator);
          this.segments = [];
        }
        process(event) {
          const segment = event.segment;
          const newEvents = [];
          if (event.consumedBy) {
            if (event.isLeft) this.queue.remove(event.otherSE);
            else this.tree.remove(segment);
            return newEvents;
          }
          const node = event.isLeft ? this.tree.add(segment) : this.tree.find(segment);
          if (!node)
            throw new Error(
              `Unable to find segment #${segment.id} [${segment.leftSE.point.x}, ${segment.leftSE.point.y}] -> [${segment.rightSE.point.x}, ${segment.rightSE.point.y}] in SweepLine tree.`,
            );
          let prevNode = node;
          let nextNode = node;
          let prevSeg = void 0;
          let nextSeg = void 0;
          while (prevSeg === void 0) {
            prevNode = this.tree.prev(prevNode);
            if (prevNode === null) prevSeg = null;
            else if (prevNode.key.consumedBy === void 0) prevSeg = prevNode.key;
          }
          while (nextSeg === void 0) {
            nextNode = this.tree.next(nextNode);
            if (nextNode === null) nextSeg = null;
            else if (nextNode.key.consumedBy === void 0) nextSeg = nextNode.key;
          }
          if (event.isLeft) {
            let prevMySplitter = null;
            if (prevSeg) {
              const prevInter = prevSeg.getIntersection(segment);
              if (prevInter !== null) {
                if (!segment.isAnEndpoint(prevInter)) prevMySplitter = prevInter;
                if (!prevSeg.isAnEndpoint(prevInter)) {
                  const newEventsFromSplit = this._splitSafely(prevSeg, prevInter);
                  for (let i = 0, iMax = newEventsFromSplit.length; i < iMax; i++) {
                    newEvents.push(newEventsFromSplit[i]);
                  }
                }
              }
            }
            let nextMySplitter = null;
            if (nextSeg) {
              const nextInter = nextSeg.getIntersection(segment);
              if (nextInter !== null) {
                if (!segment.isAnEndpoint(nextInter)) nextMySplitter = nextInter;
                if (!nextSeg.isAnEndpoint(nextInter)) {
                  const newEventsFromSplit = this._splitSafely(nextSeg, nextInter);
                  for (let i = 0, iMax = newEventsFromSplit.length; i < iMax; i++) {
                    newEvents.push(newEventsFromSplit[i]);
                  }
                }
              }
            }
            if (prevMySplitter !== null || nextMySplitter !== null) {
              let mySplitter = null;
              if (prevMySplitter === null) mySplitter = nextMySplitter;
              else if (nextMySplitter === null) mySplitter = prevMySplitter;
              else {
                const cmpSplitters = SweepEvent.comparePoints(prevMySplitter, nextMySplitter);
                mySplitter = cmpSplitters <= 0 ? prevMySplitter : nextMySplitter;
              }
              this.queue.remove(segment.rightSE);
              newEvents.push(segment.rightSE);
              const newEventsFromSplit = segment.split(mySplitter);
              for (let i = 0, iMax = newEventsFromSplit.length; i < iMax; i++) {
                newEvents.push(newEventsFromSplit[i]);
              }
            }
            if (newEvents.length > 0) {
              this.tree.remove(segment);
              newEvents.push(event);
            } else {
              this.segments.push(segment);
              segment.prev = prevSeg;
            }
          } else {
            if (prevSeg && nextSeg) {
              const inter = prevSeg.getIntersection(nextSeg);
              if (inter !== null) {
                if (!prevSeg.isAnEndpoint(inter)) {
                  const newEventsFromSplit = this._splitSafely(prevSeg, inter);
                  for (let i = 0, iMax = newEventsFromSplit.length; i < iMax; i++) {
                    newEvents.push(newEventsFromSplit[i]);
                  }
                }
                if (!nextSeg.isAnEndpoint(inter)) {
                  const newEventsFromSplit = this._splitSafely(nextSeg, inter);
                  for (let i = 0, iMax = newEventsFromSplit.length; i < iMax; i++) {
                    newEvents.push(newEventsFromSplit[i]);
                  }
                }
              }
            }
            this.tree.remove(segment);
          }
          return newEvents;
        }
        /* Safely split a segment that is currently in the datastructures
         * IE - a segment other than the one that is currently being processed. */
        _splitSafely(seg, pt) {
          this.tree.remove(seg);
          const rightSE = seg.rightSE;
          this.queue.remove(rightSE);
          const newEvents = seg.split(pt);
          newEvents.push(rightSE);
          if (seg.consumedBy === void 0) this.tree.add(seg);
          return newEvents;
        }
      }
      const POLYGON_CLIPPING_MAX_QUEUE_SIZE =
        (typeof process !== 'undefined' && process.env.POLYGON_CLIPPING_MAX_QUEUE_SIZE) || 1e6;
      const POLYGON_CLIPPING_MAX_SWEEPLINE_SEGMENTS =
        (typeof process !== 'undefined' && process.env.POLYGON_CLIPPING_MAX_SWEEPLINE_SEGMENTS) ||
        1e6;
      class Operation {
        run(type, geom, moreGeoms) {
          operation.type = type;
          rounder.reset();
          const multipolys = [new MultiPolyIn(geom, true)];
          for (let i = 0, iMax = moreGeoms.length; i < iMax; i++) {
            multipolys.push(new MultiPolyIn(moreGeoms[i], false));
          }
          operation.numMultiPolys = multipolys.length;
          if (operation.type === 'difference') {
            const subject = multipolys[0];
            let i = 1;
            while (i < multipolys.length) {
              if (getBboxOverlap(multipolys[i].bbox, subject.bbox) !== null) i++;
              else multipolys.splice(i, 1);
            }
          }
          if (operation.type === 'intersection') {
            for (let i = 0, iMax = multipolys.length; i < iMax; i++) {
              const mpA = multipolys[i];
              for (let j = i + 1, jMax = multipolys.length; j < jMax; j++) {
                if (getBboxOverlap(mpA.bbox, multipolys[j].bbox) === null) return [];
              }
            }
          }
          const queue = new Tree(SweepEvent.compare);
          for (let i = 0, iMax = multipolys.length; i < iMax; i++) {
            const sweepEvents = multipolys[i].getSweepEvents();
            for (let j = 0, jMax = sweepEvents.length; j < jMax; j++) {
              queue.insert(sweepEvents[j]);
              if (queue.size > POLYGON_CLIPPING_MAX_QUEUE_SIZE) {
                throw new Error(
                  'Infinite loop when putting segment endpoints in a priority queue (queue size too big).',
                );
              }
            }
          }
          const sweepLine = new SweepLine(queue);
          let prevQueueSize = queue.size;
          let node = queue.pop();
          while (node) {
            const evt = node.key;
            if (queue.size === prevQueueSize) {
              const seg = evt.segment;
              throw new Error(
                `Unable to pop() ${evt.isLeft ? 'left' : 'right'} SweepEvent [${evt.point.x}, ${evt.point.y}] from segment #${seg.id} [${seg.leftSE.point.x}, ${seg.leftSE.point.y}] -> [${seg.rightSE.point.x}, ${seg.rightSE.point.y}] from queue.`,
              );
            }
            if (queue.size > POLYGON_CLIPPING_MAX_QUEUE_SIZE) {
              throw new Error(
                'Infinite loop when passing sweep line over endpoints (queue size too big).',
              );
            }
            if (sweepLine.segments.length > POLYGON_CLIPPING_MAX_SWEEPLINE_SEGMENTS) {
              throw new Error(
                'Infinite loop when passing sweep line over endpoints (too many sweep line segments).',
              );
            }
            const newEvents = sweepLine.process(evt);
            for (let i = 0, iMax = newEvents.length; i < iMax; i++) {
              const evt2 = newEvents[i];
              if (evt2.consumedBy === void 0) queue.insert(evt2);
            }
            prevQueueSize = queue.size;
            node = queue.pop();
          }
          rounder.reset();
          const ringsOut = RingOut.factory(sweepLine.segments);
          const result = new MultiPolyOut(ringsOut);
          return result.getGeom();
        }
      }
      const operation = new Operation();
      const union2 = function (geom) {
        for (
          var _len = arguments.length, moreGeoms = new Array(_len > 1 ? _len - 1 : 0), _key = 1;
          _key < _len;
          _key++
        ) {
          moreGeoms[_key - 1] = arguments[_key];
        }
        return operation.run('union', geom, moreGeoms);
      };
      const intersection = function (geom) {
        for (
          var _len2 = arguments.length, moreGeoms = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1;
          _key2 < _len2;
          _key2++
        ) {
          moreGeoms[_key2 - 1] = arguments[_key2];
        }
        return operation.run('intersection', geom, moreGeoms);
      };
      const xor = function (geom) {
        for (
          var _len3 = arguments.length, moreGeoms = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1;
          _key3 < _len3;
          _key3++
        ) {
          moreGeoms[_key3 - 1] = arguments[_key3];
        }
        return operation.run('xor', geom, moreGeoms);
      };
      const difference = function (subjectGeom) {
        for (
          var _len4 = arguments.length,
            clippingGeoms = new Array(_len4 > 1 ? _len4 - 1 : 0),
            _key4 = 1;
          _key4 < _len4;
          _key4++
        ) {
          clippingGeoms[_key4 - 1] = arguments[_key4];
        }
        return operation.run('difference', subjectGeom, clippingGeoms);
      };
      var index = {
        union: union2,
        intersection,
        xor,
        difference,
      };
      return index;
    });
  },
});

// node_modules/geographiclib-geodesic/geographiclib-geodesic.min.js
var require_geographiclib_geodesic_min = __commonJS({
  'node_modules/geographiclib-geodesic/geographiclib-geodesic.min.js'(exports, module) {
    (function (cb) {
      var geodesic2 = {};
      geodesic2.Constants = {};
      geodesic2.Math = {};
      geodesic2.Accumulator = {};
      (function (c) {
        'use strict';
        c.WGS84 = { a: 6378137, f: 1 / 298.257223563 };
        c.version = { major: 2, minor: 2, patch: 0 };
        c.version_string = '2.2.0';
      })(geodesic2.Constants);
      (function (m) {
        'use strict';
        m.digits = 53;
        m.epsilon = Math.pow(0.5, m.digits - 1);
        m.degree = Math.PI / 180;
        m.sq = function (x) {
          return x * x;
        };
        m.hypot = function (x, y) {
          return Math.sqrt(x * x + y * y);
        };
        m.cbrt =
          Math.cbrt ||
          function (x) {
            var y = Math.pow(Math.abs(x), 1 / 3);
            return x > 0 ? y : x < 0 ? -y : x;
          };
        m.log1p =
          Math.log1p ||
          function (x) {
            var y = 1 + x,
              z = y - 1;
            return z === 0 ? x : (x * Math.log(y)) / z;
          };
        m.atanh =
          Math.atanh ||
          function (x) {
            var y = Math.abs(x);
            y = m.log1p((2 * y) / (1 - y)) / 2;
            return x > 0 ? y : x < 0 ? -y : x;
          };
        m.copysign = function (x, y) {
          return Math.abs(x) * (y < 0 || (y === 0 && 1 / y < 0) ? -1 : 1);
        };
        m.sum = function (u, v) {
          var s = u + v,
            up = s - v,
            vpp = s - up,
            t;
          up -= u;
          vpp -= v;
          t = s ? 0 - (up + vpp) : s;
          return { s, t };
        };
        m.polyval = function (N, p, s, x) {
          var y = N < 0 ? 0 : p[s++];
          while (--N >= 0) y = y * x + p[s++];
          return y;
        };
        m.AngRound = function (x) {
          var z = 1 / 16,
            y = Math.abs(x);
          y = y < z ? z - (z - y) : y;
          return m.copysign(y, x);
        };
        m.remainder = function (x, y) {
          x %= y;
          return x < -y / 2 ? x + y : x < y / 2 ? x : x - y;
        };
        m.AngNormalize = function (x) {
          var y = m.remainder(x, 360);
          return Math.abs(y) === 180 ? m.copysign(180, x) : y;
        };
        m.LatFix = function (x) {
          return Math.abs(x) > 90 ? NaN : x;
        };
        m.AngDiff = function (x, y) {
          var r = m.sum(m.remainder(-x, 360), m.remainder(y, 360)),
            d,
            e;
          r = m.sum(m.remainder(r.s, 360), r.t);
          d = r.s;
          e = r.t;
          if (d === 0 || Math.abs(d) === 180) d = m.copysign(d, e === 0 ? y - x : -e);
          return { d, e };
        };
        m.sincosd = function (x) {
          var d, r, q, s, c, sinx, cosx;
          d = x % 360;
          q = Math.round(d / 90);
          d -= 90 * q;
          r = d * this.degree;
          s = Math.sin(r);
          c = Math.cos(r);
          if (Math.abs(d) === 45) {
            c = Math.sqrt(0.5);
            s = m.copysign(c, r);
          } else if (Math.abs(d) === 30) {
            c = Math.sqrt(0.75);
            s = m.copysign(0.5, r);
          }
          switch (q & 3) {
            case 0:
              sinx = s;
              cosx = c;
              break;
            case 1:
              sinx = c;
              cosx = -s;
              break;
            case 2:
              sinx = -s;
              cosx = -c;
              break;
            default:
              sinx = -c;
              cosx = s;
              break;
          }
          cosx += 0;
          if (sinx === 0) sinx = m.copysign(sinx, x);
          return { s: sinx, c: cosx };
        };
        m.sincosde = function (x, t) {
          var d, r, q, s, c, sinx, cosx;
          d = x % 360;
          q = Math.round(d / 90);
          d = m.AngRound(d - 90 * q + t);
          r = d * this.degree;
          s = Math.sin(r);
          c = Math.cos(r);
          if (Math.abs(d) === 45) {
            c = Math.sqrt(0.5);
            s = m.copysign(c, r);
          } else if (Math.abs(d) === 30) {
            c = Math.sqrt(0.75);
            s = m.copysign(0.5, r);
          }
          switch (q & 3) {
            case 0:
              sinx = s;
              cosx = c;
              break;
            case 1:
              sinx = c;
              cosx = -s;
              break;
            case 2:
              sinx = -s;
              cosx = -c;
              break;
            default:
              sinx = -c;
              cosx = s;
              break;
          }
          cosx += 0;
          if (sinx === 0) sinx = m.copysign(sinx, x + t);
          return { s: sinx, c: cosx };
        };
        m.atan2d = function (y, x) {
          var q = 0,
            ang;
          if (Math.abs(y) > Math.abs(x)) {
            [y, x] = [x, y];
            q = 2;
          }
          if (m.copysign(1, x) < 0) {
            x = -x;
            ++q;
          }
          ang = Math.atan2(y, x) / this.degree;
          switch (q) {
            case 1:
              ang = m.copysign(180, y) - ang;
              break;
            case 2:
              ang = 90 - ang;
              break;
            case 3:
              ang = -90 + ang;
              break;
            default:
              break;
          }
          return ang;
        };
      })(geodesic2.Math);
      (function (a, m) {
        'use strict';
        a.Accumulator = function (y) {
          this.Set(y);
        };
        a.Accumulator.prototype.Set = function (y) {
          if (!y) y = 0;
          if (y.constructor === a.Accumulator) {
            this._s = y._s;
            this._t = y._t;
          } else {
            this._s = y;
            this._t = 0;
          }
        };
        a.Accumulator.prototype.Add = function (y) {
          var u = m.sum(y, this._t),
            v = m.sum(u.s, this._s);
          u = u.t;
          this._s = v.s;
          this._t = v.t;
          if (this._s === 0) this._s = u;
          else this._t += u;
        };
        a.Accumulator.prototype.Sum = function (y) {
          var b;
          if (!y) return this._s;
          else {
            b = new a.Accumulator(this);
            b.Add(y);
            return b._s;
          }
        };
        a.Accumulator.prototype.Negate = function () {
          this._s *= -1;
          this._t *= -1;
        };
        a.Accumulator.prototype.Remainder = function (y) {
          this._s = m.remainder(this._s, y);
          this.Add(0);
        };
      })(geodesic2.Accumulator, geodesic2.Math);
      geodesic2.Geodesic = {};
      geodesic2.GeodesicLine = {};
      geodesic2.PolygonArea = {};
      (function (g, l, p, m, c) {
        'use strict';
        var GEOGRAPHICLIB_GEODESIC_ORDER = 6,
          nA1_ = GEOGRAPHICLIB_GEODESIC_ORDER,
          nA2_ = GEOGRAPHICLIB_GEODESIC_ORDER,
          nA3_ = GEOGRAPHICLIB_GEODESIC_ORDER,
          nA3x_ = nA3_,
          nC3x_,
          nC4x_,
          maxit1_ = 20,
          maxit2_ = maxit1_ + m.digits + 10,
          tol0_ = m.epsilon,
          tol1_ = 200 * tol0_,
          tol2_ = Math.sqrt(tol0_),
          tolb_ = tol0_,
          xthresh_ = 1e3 * tol2_,
          CAP_NONE = 0,
          CAP_ALL = 31,
          OUT_ALL = 32640,
          astroid,
          A1m1f_coeff,
          C1f_coeff,
          C1pf_coeff,
          A2m1f_coeff,
          C2f_coeff,
          A3_coeff,
          C3_coeff,
          C4_coeff;
        g.tiny_ = Math.sqrt(Number.MIN_VALUE / Number.EPSILON);
        g.nC1_ = GEOGRAPHICLIB_GEODESIC_ORDER;
        g.nC1p_ = GEOGRAPHICLIB_GEODESIC_ORDER;
        g.nC2_ = GEOGRAPHICLIB_GEODESIC_ORDER;
        g.nC3_ = GEOGRAPHICLIB_GEODESIC_ORDER;
        g.nC4_ = GEOGRAPHICLIB_GEODESIC_ORDER;
        nC3x_ = (g.nC3_ * (g.nC3_ - 1)) / 2;
        nC4x_ = (g.nC4_ * (g.nC4_ + 1)) / 2;
        g.CAP_C1 = 1 << 0;
        g.CAP_C1p = 1 << 1;
        g.CAP_C2 = 1 << 2;
        g.CAP_C3 = 1 << 3;
        g.CAP_C4 = 1 << 4;
        g.NONE = 0;
        g.ARC = 1 << 6;
        g.LATITUDE = (1 << 7) | CAP_NONE;
        g.LONGITUDE = (1 << 8) | g.CAP_C3;
        g.AZIMUTH = (1 << 9) | CAP_NONE;
        g.DISTANCE = (1 << 10) | g.CAP_C1;
        g.STANDARD = g.LATITUDE | g.LONGITUDE | g.AZIMUTH | g.DISTANCE;
        g.DISTANCE_IN = (1 << 11) | g.CAP_C1 | g.CAP_C1p;
        g.REDUCEDLENGTH = (1 << 12) | g.CAP_C1 | g.CAP_C2;
        g.GEODESICSCALE = (1 << 13) | g.CAP_C1 | g.CAP_C2;
        g.AREA = (1 << 14) | g.CAP_C4;
        g.ALL = OUT_ALL | CAP_ALL;
        g.LONG_UNROLL = 1 << 15;
        g.OUT_MASK = OUT_ALL | g.LONG_UNROLL;
        g.SinCosSeries = function (sinp, sinx, cosx, c2) {
          var k = c2.length,
            n = k - (sinp ? 1 : 0),
            ar = 2 * (cosx - sinx) * (cosx + sinx),
            y0 = n & 1 ? c2[--k] : 0,
            y1 = 0;
          n = Math.floor(n / 2);
          while (n--) {
            y1 = ar * y0 - y1 + c2[--k];
            y0 = ar * y1 - y0 + c2[--k];
          }
          return sinp ? 2 * sinx * cosx * y0 : cosx * (y0 - y1);
        };
        astroid = function (x, y) {
          var k,
            p2 = m.sq(x),
            q = m.sq(y),
            r = (p2 + q - 1) / 6,
            S,
            r2,
            r3,
            disc,
            u,
            T3,
            T,
            ang,
            v,
            uv,
            w;
          if (!(q === 0 && r <= 0)) {
            S = (p2 * q) / 4;
            r2 = m.sq(r);
            r3 = r * r2;
            disc = S * (S + 2 * r3);
            u = r;
            if (disc >= 0) {
              T3 = S + r3;
              T3 += T3 < 0 ? -Math.sqrt(disc) : Math.sqrt(disc);
              T = m.cbrt(T3);
              u += T + (T !== 0 ? r2 / T : 0);
            } else {
              ang = Math.atan2(Math.sqrt(-disc), -(S + r3));
              u += 2 * r * Math.cos(ang / 3);
            }
            v = Math.sqrt(m.sq(u) + q);
            uv = u < 0 ? q / (v - u) : u + v;
            w = (uv - q) / (2 * v);
            k = uv / (Math.sqrt(uv + m.sq(w)) + w);
          } else {
            k = 0;
          }
          return k;
        };
        A1m1f_coeff = [1, 4, 64, 0, 256];
        g.A1m1f = function (eps) {
          var p2 = Math.floor(nA1_ / 2),
            t = m.polyval(p2, A1m1f_coeff, 0, m.sq(eps)) / A1m1f_coeff[p2 + 1];
          return (t + eps) / (1 - eps);
        };
        C1f_coeff = [
          -1, 6, -16, 32, -9, 64, -128, 2048, 9, -16, 768, 3, -5, 512, -7, 1280, -7, 2048,
        ];
        g.C1f = function (eps, c2) {
          var eps2 = m.sq(eps),
            d = eps,
            o = 0,
            l2,
            p2;
          for (l2 = 1; l2 <= g.nC1_; ++l2) {
            p2 = Math.floor((g.nC1_ - l2) / 2);
            c2[l2] = (d * m.polyval(p2, C1f_coeff, o, eps2)) / C1f_coeff[o + p2 + 1];
            o += p2 + 2;
            d *= eps;
          }
        };
        C1pf_coeff = [
          205, -432, 768, 1536, 4005, -4736, 3840, 12288, -225, 116, 384, -7173, 2695, 7680, 3467,
          7680, 38081, 61440,
        ];
        g.C1pf = function (eps, c2) {
          var eps2 = m.sq(eps),
            d = eps,
            o = 0,
            l2,
            p2;
          for (l2 = 1; l2 <= g.nC1p_; ++l2) {
            p2 = Math.floor((g.nC1p_ - l2) / 2);
            c2[l2] = (d * m.polyval(p2, C1pf_coeff, o, eps2)) / C1pf_coeff[o + p2 + 1];
            o += p2 + 2;
            d *= eps;
          }
        };
        A2m1f_coeff = [-11, -28, -192, 0, 256];
        g.A2m1f = function (eps) {
          var p2 = Math.floor(nA2_ / 2),
            t = m.polyval(p2, A2m1f_coeff, 0, m.sq(eps)) / A2m1f_coeff[p2 + 1];
          return (t - eps) / (1 + eps);
        };
        C2f_coeff = [1, 2, 16, 32, 35, 64, 384, 2048, 15, 80, 768, 7, 35, 512, 63, 1280, 77, 2048];
        g.C2f = function (eps, c2) {
          var eps2 = m.sq(eps),
            d = eps,
            o = 0,
            l2,
            p2;
          for (l2 = 1; l2 <= g.nC2_; ++l2) {
            p2 = Math.floor((g.nC2_ - l2) / 2);
            c2[l2] = (d * m.polyval(p2, C2f_coeff, o, eps2)) / C2f_coeff[o + p2 + 1];
            o += p2 + 2;
            d *= eps;
          }
        };
        g.Geodesic = function (a, f) {
          this.a = a;
          this.f = f;
          this._f1 = 1 - this.f;
          this._e2 = this.f * (2 - this.f);
          this._ep2 = this._e2 / m.sq(this._f1);
          this._n = this.f / (2 - this.f);
          this._b = this.a * this._f1;
          this._c2 =
            (m.sq(this.a) +
              m.sq(this._b) *
                (this._e2 === 0
                  ? 1
                  : (this._e2 > 0
                      ? m.atanh(Math.sqrt(this._e2))
                      : Math.atan(Math.sqrt(-this._e2))) / Math.sqrt(Math.abs(this._e2)))) /
            2;
          this._etol2 =
            (0.1 * tol2_) /
            Math.sqrt((Math.max(1e-3, Math.abs(this.f)) * Math.min(1, 1 - this.f / 2)) / 2);
          if (!(isFinite(this.a) && this.a > 0))
            throw new Error('Equatorial radius is not positive');
          if (!(isFinite(this._b) && this._b > 0))
            throw new Error('Polar semi-axis is not positive');
          this._A3x = new Array(nA3x_);
          this._C3x = new Array(nC3x_);
          this._C4x = new Array(nC4x_);
          this.A3coeff();
          this.C3coeff();
          this.C4coeff();
        };
        A3_coeff = [-3, 128, -2, -3, 64, -1, -3, -1, 16, 3, -1, -2, 8, 1, -1, 2, 1, 1];
        g.Geodesic.prototype.A3coeff = function () {
          var o = 0,
            k = 0,
            j,
            p2;
          for (j = nA3_ - 1; j >= 0; --j) {
            p2 = Math.min(nA3_ - j - 1, j);
            this._A3x[k++] = m.polyval(p2, A3_coeff, o, this._n) / A3_coeff[o + p2 + 1];
            o += p2 + 2;
          }
        };
        C3_coeff = [
          3, 128, 2, 5, 128, -1, 3, 3, 64, -1, 0, 1, 8, -1, 1, 4, 5, 256, 1, 3, 128, -3, -2, 3, 64,
          1, -3, 2, 32, 7, 512, -10, 9, 384, 5, -9, 5, 192, 7, 512, -14, 7, 512, 21, 2560,
        ];
        g.Geodesic.prototype.C3coeff = function () {
          var o = 0,
            k = 0,
            l2,
            j,
            p2;
          for (l2 = 1; l2 < g.nC3_; ++l2) {
            for (j = g.nC3_ - 1; j >= l2; --j) {
              p2 = Math.min(g.nC3_ - j - 1, j);
              this._C3x[k++] = m.polyval(p2, C3_coeff, o, this._n) / C3_coeff[o + p2 + 1];
              o += p2 + 2;
            }
          }
        };
        C4_coeff = [
          97, 15015, 1088, 156, 45045, -224, -4784, 1573, 45045, -10656, 14144, -4576, -858, 45045,
          64, 624, -4576, 6864, -3003, 15015, 100, 208, 572, 3432, -12012, 30030, 45045, 1, 9009,
          -2944, 468, 135135, 5792, 1040, -1287, 135135, 5952, -11648, 9152, -2574, 135135, -64,
          -624, 4576, -6864, 3003, 135135, 8, 10725, 1856, -936, 225225, -8448, 4992, -1144, 225225,
          -1440, 4160, -4576, 1716, 225225, -136, 63063, 1024, -208, 105105, 3584, -3328, 1144,
          315315, -128, 135135, -2560, 832, 405405, 128, 99099,
        ];
        g.Geodesic.prototype.C4coeff = function () {
          var o = 0,
            k = 0,
            l2,
            j,
            p2;
          for (l2 = 0; l2 < g.nC4_; ++l2) {
            for (j = g.nC4_ - 1; j >= l2; --j) {
              p2 = g.nC4_ - j - 1;
              this._C4x[k++] = m.polyval(p2, C4_coeff, o, this._n) / C4_coeff[o + p2 + 1];
              o += p2 + 2;
            }
          }
        };
        g.Geodesic.prototype.A3f = function (eps) {
          return m.polyval(nA3x_ - 1, this._A3x, 0, eps);
        };
        g.Geodesic.prototype.C3f = function (eps, c2) {
          var mult = 1,
            o = 0,
            l2,
            p2;
          for (l2 = 1; l2 < g.nC3_; ++l2) {
            p2 = g.nC3_ - l2 - 1;
            mult *= eps;
            c2[l2] = mult * m.polyval(p2, this._C3x, o, eps);
            o += p2 + 1;
          }
        };
        g.Geodesic.prototype.C4f = function (eps, c2) {
          var mult = 1,
            o = 0,
            l2,
            p2;
          for (l2 = 0; l2 < g.nC4_; ++l2) {
            p2 = g.nC4_ - l2 - 1;
            c2[l2] = mult * m.polyval(p2, this._C4x, o, eps);
            o += p2 + 1;
            mult *= eps;
          }
        };
        g.Geodesic.prototype.Lengths = function (
          eps,
          sig12,
          ssig1,
          csig1,
          dn1,
          ssig2,
          csig2,
          dn2,
          cbet1,
          cbet2,
          outmask,
          C1a,
          C2a,
        ) {
          outmask &= g.OUT_MASK;
          var vals = {},
            m0x = 0,
            J12 = 0,
            A1 = 0,
            A2 = 0,
            B1,
            B2,
            l2,
            csig12,
            t;
          if (outmask & (g.DISTANCE | g.REDUCEDLENGTH | g.GEODESICSCALE)) {
            A1 = g.A1m1f(eps);
            g.C1f(eps, C1a);
            if (outmask & (g.REDUCEDLENGTH | g.GEODESICSCALE)) {
              A2 = g.A2m1f(eps);
              g.C2f(eps, C2a);
              m0x = A1 - A2;
              A2 = 1 + A2;
            }
            A1 = 1 + A1;
          }
          if (outmask & g.DISTANCE) {
            B1 = g.SinCosSeries(true, ssig2, csig2, C1a) - g.SinCosSeries(true, ssig1, csig1, C1a);
            vals.s12b = A1 * (sig12 + B1);
            if (outmask & (g.REDUCEDLENGTH | g.GEODESICSCALE)) {
              B2 =
                g.SinCosSeries(true, ssig2, csig2, C2a) - g.SinCosSeries(true, ssig1, csig1, C2a);
              J12 = m0x * sig12 + (A1 * B1 - A2 * B2);
            }
          } else if (outmask & (g.REDUCEDLENGTH | g.GEODESICSCALE)) {
            for (l2 = 1; l2 <= g.nC2_; ++l2) C2a[l2] = A1 * C1a[l2] - A2 * C2a[l2];
            J12 =
              m0x * sig12 +
              (g.SinCosSeries(true, ssig2, csig2, C2a) - g.SinCosSeries(true, ssig1, csig1, C2a));
          }
          if (outmask & g.REDUCEDLENGTH) {
            vals.m0 = m0x;
            vals.m12b = dn2 * (csig1 * ssig2) - dn1 * (ssig1 * csig2) - csig1 * csig2 * J12;
          } else vals.m12b = NaN;
          if (outmask & g.GEODESICSCALE) {
            csig12 = csig1 * csig2 + ssig1 * ssig2;
            t = (this._ep2 * (cbet1 - cbet2) * (cbet1 + cbet2)) / (dn1 + dn2);
            vals.M12 = csig12 + ((t * ssig2 - csig2 * J12) * ssig1) / dn1;
            vals.M21 = csig12 - ((t * ssig1 - csig1 * J12) * ssig2) / dn2;
          }
          return vals;
        };
        g.Geodesic.prototype.InverseStart = function (
          sbet1,
          cbet1,
          dn1,
          sbet2,
          cbet2,
          dn2,
          lam12,
          slam12,
          clam12,
          C1a,
          C2a,
        ) {
          var vals = {},
            sbet12 = sbet2 * cbet1 - cbet2 * sbet1,
            cbet12 = cbet2 * cbet1 + sbet2 * sbet1,
            sbet12a,
            shortline,
            omg12,
            sbetm2,
            somg12,
            comg12,
            t,
            ssig12,
            csig12,
            x,
            y,
            lamscale,
            betscale,
            k2,
            eps,
            cbet12a,
            bet12a,
            m12b,
            m0,
            nvals,
            k,
            omg12a,
            lam12x;
          vals.sig12 = -1;
          sbet12a = sbet2 * cbet1;
          sbet12a += cbet2 * sbet1;
          shortline = cbet12 >= 0 && sbet12 < 0.5 && cbet2 * lam12 < 0.5;
          if (shortline) {
            sbetm2 = m.sq(sbet1 + sbet2);
            sbetm2 /= sbetm2 + m.sq(cbet1 + cbet2);
            vals.dnm = Math.sqrt(1 + this._ep2 * sbetm2);
            omg12 = lam12 / (this._f1 * vals.dnm);
            somg12 = Math.sin(omg12);
            comg12 = Math.cos(omg12);
          } else {
            somg12 = slam12;
            comg12 = clam12;
          }
          vals.salp1 = cbet2 * somg12;
          vals.calp1 =
            comg12 >= 0
              ? sbet12 + (cbet2 * sbet1 * m.sq(somg12)) / (1 + comg12)
              : sbet12a - (cbet2 * sbet1 * m.sq(somg12)) / (1 - comg12);
          ssig12 = m.hypot(vals.salp1, vals.calp1);
          csig12 = sbet1 * sbet2 + cbet1 * cbet2 * comg12;
          if (shortline && ssig12 < this._etol2) {
            vals.salp2 = cbet1 * somg12;
            vals.calp2 =
              sbet12 - cbet1 * sbet2 * (comg12 >= 0 ? m.sq(somg12) / (1 + comg12) : 1 - comg12);
            t = m.hypot(vals.salp2, vals.calp2);
            vals.salp2 /= t;
            vals.calp2 /= t;
            vals.sig12 = Math.atan2(ssig12, csig12);
          } else if (
            Math.abs(this._n) > 0.1 ||
            csig12 >= 0 ||
            ssig12 >= 6 * Math.abs(this._n) * Math.PI * m.sq(cbet1)
          ) {
          } else {
            lam12x = Math.atan2(-slam12, -clam12);
            if (this.f >= 0) {
              k2 = m.sq(sbet1) * this._ep2;
              eps = k2 / (2 * (1 + Math.sqrt(1 + k2)) + k2);
              lamscale = this.f * cbet1 * this.A3f(eps) * Math.PI;
              betscale = lamscale * cbet1;
              x = lam12x / lamscale;
              y = sbet12a / betscale;
            } else {
              cbet12a = cbet2 * cbet1 - sbet2 * sbet1;
              bet12a = Math.atan2(sbet12a, cbet12a);
              nvals = this.Lengths(
                this._n,
                Math.PI + bet12a,
                sbet1,
                -cbet1,
                dn1,
                sbet2,
                cbet2,
                dn2,
                cbet1,
                cbet2,
                g.REDUCEDLENGTH,
                C1a,
                C2a,
              );
              m12b = nvals.m12b;
              m0 = nvals.m0;
              x = -1 + m12b / (cbet1 * cbet2 * m0 * Math.PI);
              betscale = x < -0.01 ? sbet12a / x : -this.f * m.sq(cbet1) * Math.PI;
              lamscale = betscale / cbet1;
              y = lam12 / lamscale;
            }
            if (y > -tol1_ && x > -1 - xthresh_) {
              if (this.f >= 0) {
                vals.salp1 = Math.min(1, -x);
                vals.calp1 = -Math.sqrt(1 - m.sq(vals.salp1));
              } else {
                vals.calp1 = Math.max(x > -tol1_ ? 0 : -1, x);
                vals.salp1 = Math.sqrt(1 - m.sq(vals.calp1));
              }
            } else {
              k = astroid(x, y);
              omg12a = lamscale * (this.f >= 0 ? (-x * k) / (1 + k) : (-y * (1 + k)) / k);
              somg12 = Math.sin(omg12a);
              comg12 = -Math.cos(omg12a);
              vals.salp1 = cbet2 * somg12;
              vals.calp1 = sbet12a - (cbet2 * sbet1 * m.sq(somg12)) / (1 - comg12);
            }
          }
          if (!(vals.salp1 <= 0)) {
            t = m.hypot(vals.salp1, vals.calp1);
            vals.salp1 /= t;
            vals.calp1 /= t;
          } else {
            vals.salp1 = 1;
            vals.calp1 = 0;
          }
          return vals;
        };
        g.Geodesic.prototype.Lambda12 = function (
          sbet1,
          cbet1,
          dn1,
          sbet2,
          cbet2,
          dn2,
          salp1,
          calp1,
          slam120,
          clam120,
          diffp,
          C1a,
          C2a,
          C3a,
        ) {
          var vals = {},
            t,
            salp0,
            calp0,
            somg1,
            comg1,
            somg2,
            comg2,
            somg12,
            comg12,
            B312,
            eta,
            k2,
            nvals;
          if (sbet1 === 0 && calp1 === 0) calp1 = -g.tiny_;
          salp0 = salp1 * cbet1;
          calp0 = m.hypot(calp1, salp1 * sbet1);
          vals.ssig1 = sbet1;
          somg1 = salp0 * sbet1;
          vals.csig1 = comg1 = calp1 * cbet1;
          t = m.hypot(vals.ssig1, vals.csig1);
          vals.ssig1 /= t;
          vals.csig1 /= t;
          vals.salp2 = cbet2 !== cbet1 ? salp0 / cbet2 : salp1;
          vals.calp2 =
            cbet2 !== cbet1 || Math.abs(sbet2) !== -sbet1
              ? Math.sqrt(
                  m.sq(calp1 * cbet1) +
                    (cbet1 < -sbet1
                      ? (cbet2 - cbet1) * (cbet1 + cbet2)
                      : (sbet1 - sbet2) * (sbet1 + sbet2)),
                ) / cbet2
              : Math.abs(calp1);
          vals.ssig2 = sbet2;
          somg2 = salp0 * sbet2;
          vals.csig2 = comg2 = vals.calp2 * cbet2;
          t = m.hypot(vals.ssig2, vals.csig2);
          vals.ssig2 /= t;
          vals.csig2 /= t;
          vals.sig12 = Math.atan2(
            Math.max(0, vals.csig1 * vals.ssig2 - vals.ssig1 * vals.csig2),
            vals.csig1 * vals.csig2 + vals.ssig1 * vals.ssig2,
          );
          somg12 = Math.max(0, comg1 * somg2 - somg1 * comg2);
          comg12 = comg1 * comg2 + somg1 * somg2;
          eta = Math.atan2(
            somg12 * clam120 - comg12 * slam120,
            comg12 * clam120 + somg12 * slam120,
          );
          k2 = m.sq(calp0) * this._ep2;
          vals.eps = k2 / (2 * (1 + Math.sqrt(1 + k2)) + k2);
          this.C3f(vals.eps, C3a);
          B312 =
            g.SinCosSeries(true, vals.ssig2, vals.csig2, C3a) -
            g.SinCosSeries(true, vals.ssig1, vals.csig1, C3a);
          vals.domg12 = -this.f * this.A3f(vals.eps) * salp0 * (vals.sig12 + B312);
          vals.lam12 = eta + vals.domg12;
          if (diffp) {
            if (vals.calp2 === 0) vals.dlam12 = (-2 * this._f1 * dn1) / sbet1;
            else {
              nvals = this.Lengths(
                vals.eps,
                vals.sig12,
                vals.ssig1,
                vals.csig1,
                dn1,
                vals.ssig2,
                vals.csig2,
                dn2,
                cbet1,
                cbet2,
                g.REDUCEDLENGTH,
                C1a,
                C2a,
              );
              vals.dlam12 = nvals.m12b;
              vals.dlam12 *= this._f1 / (vals.calp2 * cbet2);
            }
          }
          return vals;
        };
        g.Geodesic.prototype.Inverse = function (lat1, lon1, lat2, lon2, outmask) {
          var r, vals;
          if (!outmask) outmask = g.STANDARD;
          if (outmask === g.LONG_UNROLL) outmask |= g.STANDARD;
          outmask &= g.OUT_MASK;
          r = this.InverseInt(lat1, lon1, lat2, lon2, outmask);
          vals = r.vals;
          if (outmask & g.AZIMUTH) {
            vals.azi1 = m.atan2d(r.salp1, r.calp1);
            vals.azi2 = m.atan2d(r.salp2, r.calp2);
          }
          return vals;
        };
        g.Geodesic.prototype.InverseInt = function (lat1, lon1, lat2, lon2, outmask) {
          var vals = {},
            lon12,
            lon12s,
            lonsign,
            t,
            swapp,
            latsign,
            sbet1,
            cbet1,
            sbet2,
            cbet2,
            s12x,
            m12x,
            dn1,
            dn2,
            lam12,
            slam12,
            clam12,
            sig12,
            calp1,
            salp1,
            calp2,
            salp2,
            C1a,
            C2a,
            C3a,
            meridian,
            nvals,
            ssig1,
            csig1,
            ssig2,
            csig2,
            eps,
            omg12,
            dnm,
            numit,
            salp1a,
            calp1a,
            salp1b,
            calp1b,
            tripn,
            tripb,
            v,
            dv,
            dalp1,
            sdalp1,
            cdalp1,
            nsalp1,
            lengthmask,
            salp0,
            calp0,
            alp12,
            k2,
            A4,
            C4a,
            B41,
            B42,
            somg12,
            comg12,
            domg12,
            dbet1,
            dbet2,
            salp12,
            calp12,
            sdomg12,
            cdomg12;
          vals.lat1 = lat1 = m.LatFix(lat1);
          vals.lat2 = lat2 = m.LatFix(lat2);
          lat1 = m.AngRound(lat1);
          lat2 = m.AngRound(lat2);
          lon12 = m.AngDiff(lon1, lon2);
          lon12s = lon12.e;
          lon12 = lon12.d;
          if (outmask & g.LONG_UNROLL) {
            vals.lon1 = lon1;
            vals.lon2 = lon1 + lon12 + lon12s;
          } else {
            vals.lon1 = m.AngNormalize(lon1);
            vals.lon2 = m.AngNormalize(lon2);
          }
          lonsign = m.copysign(1, lon12);
          lon12 *= lonsign;
          lon12s *= lonsign;
          lam12 = lon12 * m.degree;
          t = m.sincosde(lon12, lon12s);
          slam12 = t.s;
          clam12 = t.c;
          lon12s = 180 - lon12 - lon12s;
          swapp = Math.abs(lat1) < Math.abs(lat2) || isNaN(lat2) ? -1 : 1;
          if (swapp < 0) {
            lonsign *= -1;
            [lat2, lat1] = [lat1, lat2];
          }
          latsign = m.copysign(1, -lat1);
          lat1 *= latsign;
          lat2 *= latsign;
          t = m.sincosd(lat1);
          sbet1 = this._f1 * t.s;
          cbet1 = t.c;
          t = m.hypot(sbet1, cbet1);
          sbet1 /= t;
          cbet1 /= t;
          cbet1 = Math.max(g.tiny_, cbet1);
          t = m.sincosd(lat2);
          sbet2 = this._f1 * t.s;
          cbet2 = t.c;
          t = m.hypot(sbet2, cbet2);
          sbet2 /= t;
          cbet2 /= t;
          cbet2 = Math.max(g.tiny_, cbet2);
          if (cbet1 < -sbet1) {
            if (cbet2 === cbet1) sbet2 = m.copysign(sbet1, sbet2);
          } else {
            if (Math.abs(sbet2) === -sbet1) cbet2 = cbet1;
          }
          dn1 = Math.sqrt(1 + this._ep2 * m.sq(sbet1));
          dn2 = Math.sqrt(1 + this._ep2 * m.sq(sbet2));
          C1a = new Array(g.nC1_ + 1);
          C2a = new Array(g.nC2_ + 1);
          C3a = new Array(g.nC3_);
          meridian = lat1 === -90 || slam12 === 0;
          if (meridian) {
            calp1 = clam12;
            salp1 = slam12;
            calp2 = 1;
            salp2 = 0;
            ssig1 = sbet1;
            csig1 = calp1 * cbet1;
            ssig2 = sbet2;
            csig2 = calp2 * cbet2;
            sig12 = Math.atan2(
              Math.max(0, csig1 * ssig2 - ssig1 * csig2),
              csig1 * csig2 + ssig1 * ssig2,
            );
            nvals = this.Lengths(
              this._n,
              sig12,
              ssig1,
              csig1,
              dn1,
              ssig2,
              csig2,
              dn2,
              cbet1,
              cbet2,
              outmask | g.DISTANCE | g.REDUCEDLENGTH,
              C1a,
              C2a,
            );
            s12x = nvals.s12b;
            m12x = nvals.m12b;
            if (outmask & g.GEODESICSCALE) {
              vals.M12 = nvals.M12;
              vals.M21 = nvals.M21;
            }
            if (sig12 < tol2_ || m12x >= 0) {
              if (sig12 < 3 * g.tiny_ || (sig12 < tol0_ && (s12x < 0 || m12x < 0)))
                sig12 = m12x = s12x = 0;
              m12x *= this._b;
              s12x *= this._b;
              vals.a12 = sig12 / m.degree;
            } else meridian = false;
          }
          somg12 = 2;
          if (!meridian && sbet1 === 0 && (this.f <= 0 || lon12s >= this.f * 180)) {
            calp1 = calp2 = 0;
            salp1 = salp2 = 1;
            s12x = this.a * lam12;
            sig12 = omg12 = lam12 / this._f1;
            m12x = this._b * Math.sin(sig12);
            if (outmask & g.GEODESICSCALE) vals.M12 = vals.M21 = Math.cos(sig12);
            vals.a12 = lon12 / this._f1;
          } else if (!meridian) {
            nvals = this.InverseStart(
              sbet1,
              cbet1,
              dn1,
              sbet2,
              cbet2,
              dn2,
              lam12,
              slam12,
              clam12,
              C1a,
              C2a,
            );
            sig12 = nvals.sig12;
            salp1 = nvals.salp1;
            calp1 = nvals.calp1;
            if (sig12 >= 0) {
              salp2 = nvals.salp2;
              calp2 = nvals.calp2;
              dnm = nvals.dnm;
              s12x = sig12 * this._b * dnm;
              m12x = m.sq(dnm) * this._b * Math.sin(sig12 / dnm);
              if (outmask & g.GEODESICSCALE) vals.M12 = vals.M21 = Math.cos(sig12 / dnm);
              vals.a12 = sig12 / m.degree;
              omg12 = lam12 / (this._f1 * dnm);
            } else {
              numit = 0;
              salp1a = g.tiny_;
              calp1a = 1;
              salp1b = g.tiny_;
              calp1b = -1;
              for (tripn = false, tripb = false; ; ++numit) {
                nvals = this.Lambda12(
                  sbet1,
                  cbet1,
                  dn1,
                  sbet2,
                  cbet2,
                  dn2,
                  salp1,
                  calp1,
                  slam12,
                  clam12,
                  numit < maxit1_,
                  C1a,
                  C2a,
                  C3a,
                );
                v = nvals.lam12;
                salp2 = nvals.salp2;
                calp2 = nvals.calp2;
                sig12 = nvals.sig12;
                ssig1 = nvals.ssig1;
                csig1 = nvals.csig1;
                ssig2 = nvals.ssig2;
                csig2 = nvals.csig2;
                eps = nvals.eps;
                domg12 = nvals.domg12;
                dv = nvals.dlam12;
                if (tripb || !(Math.abs(v) >= (tripn ? 8 : 1) * tol0_) || numit == maxit2_) break;
                if (v > 0 && (numit < maxit1_ || calp1 / salp1 > calp1b / salp1b)) {
                  salp1b = salp1;
                  calp1b = calp1;
                } else if (v < 0 && (numit < maxit1_ || calp1 / salp1 < calp1a / salp1a)) {
                  salp1a = salp1;
                  calp1a = calp1;
                }
                if (numit < maxit1_ && dv > 0) {
                  dalp1 = -v / dv;
                  if (Math.abs(dalp1) < Math.PI) {
                    sdalp1 = Math.sin(dalp1);
                    cdalp1 = Math.cos(dalp1);
                    nsalp1 = salp1 * cdalp1 + calp1 * sdalp1;
                    if (nsalp1 > 0) {
                      calp1 = calp1 * cdalp1 - salp1 * sdalp1;
                      salp1 = nsalp1;
                      t = m.hypot(salp1, calp1);
                      salp1 /= t;
                      calp1 /= t;
                      tripn = Math.abs(v) <= 16 * tol0_;
                      continue;
                    }
                  }
                }
                salp1 = (salp1a + salp1b) / 2;
                calp1 = (calp1a + calp1b) / 2;
                t = m.hypot(salp1, calp1);
                salp1 /= t;
                calp1 /= t;
                tripn = false;
                tripb =
                  Math.abs(salp1a - salp1) + (calp1a - calp1) < tolb_ ||
                  Math.abs(salp1 - salp1b) + (calp1 - calp1b) < tolb_;
              }
              lengthmask =
                outmask | (outmask & (g.REDUCEDLENGTH | g.GEODESICSCALE) ? g.DISTANCE : g.NONE);
              nvals = this.Lengths(
                eps,
                sig12,
                ssig1,
                csig1,
                dn1,
                ssig2,
                csig2,
                dn2,
                cbet1,
                cbet2,
                lengthmask,
                C1a,
                C2a,
              );
              s12x = nvals.s12b;
              m12x = nvals.m12b;
              if (outmask & g.GEODESICSCALE) {
                vals.M12 = nvals.M12;
                vals.M21 = nvals.M21;
              }
              m12x *= this._b;
              s12x *= this._b;
              vals.a12 = sig12 / m.degree;
              if (outmask & g.AREA) {
                sdomg12 = Math.sin(domg12);
                cdomg12 = Math.cos(domg12);
                somg12 = slam12 * cdomg12 - clam12 * sdomg12;
                comg12 = clam12 * cdomg12 + slam12 * sdomg12;
              }
            }
          }
          if (outmask & g.DISTANCE) vals.s12 = 0 + s12x;
          if (outmask & g.REDUCEDLENGTH) vals.m12 = 0 + m12x;
          if (outmask & g.AREA) {
            salp0 = salp1 * cbet1;
            calp0 = m.hypot(calp1, salp1 * sbet1);
            if (calp0 !== 0 && salp0 !== 0) {
              ssig1 = sbet1;
              csig1 = calp1 * cbet1;
              ssig2 = sbet2;
              csig2 = calp2 * cbet2;
              k2 = m.sq(calp0) * this._ep2;
              eps = k2 / (2 * (1 + Math.sqrt(1 + k2)) + k2);
              A4 = m.sq(this.a) * calp0 * salp0 * this._e2;
              t = m.hypot(ssig1, csig1);
              ssig1 /= t;
              csig1 /= t;
              t = m.hypot(ssig2, csig2);
              ssig2 /= t;
              csig2 /= t;
              C4a = new Array(g.nC4_);
              this.C4f(eps, C4a);
              B41 = g.SinCosSeries(false, ssig1, csig1, C4a);
              B42 = g.SinCosSeries(false, ssig2, csig2, C4a);
              vals.S12 = A4 * (B42 - B41);
            } else vals.S12 = 0;
            if (!meridian && somg12 == 2) {
              somg12 = Math.sin(omg12);
              comg12 = Math.cos(omg12);
            }
            if (!meridian && comg12 > -0.7071 && sbet2 - sbet1 < 1.75) {
              domg12 = 1 + comg12;
              dbet1 = 1 + cbet1;
              dbet2 = 1 + cbet2;
              alp12 =
                2 *
                Math.atan2(
                  somg12 * (sbet1 * dbet2 + sbet2 * dbet1),
                  domg12 * (sbet1 * sbet2 + dbet1 * dbet2),
                );
            } else {
              salp12 = salp2 * calp1 - calp2 * salp1;
              calp12 = calp2 * calp1 + salp2 * salp1;
              if (salp12 === 0 && calp12 < 0) {
                salp12 = g.tiny_ * calp1;
                calp12 = -1;
              }
              alp12 = Math.atan2(salp12, calp12);
            }
            vals.S12 += this._c2 * alp12;
            vals.S12 *= swapp * lonsign * latsign;
            vals.S12 += 0;
          }
          if (swapp < 0) {
            [salp2, salp1] = [salp1, salp2];
            [calp2, calp1] = [calp1, calp2];
            if (outmask & g.GEODESICSCALE) {
              [vals.M21, vals.M12] = [vals.M12, vals.M21];
            }
          }
          salp1 *= swapp * lonsign;
          calp1 *= swapp * latsign;
          salp2 *= swapp * lonsign;
          calp2 *= swapp * latsign;
          return { vals, salp1, calp1, salp2, calp2 };
        };
        g.Geodesic.prototype.GenDirect = function (lat1, lon1, azi1, arcmode, s12_a12, outmask) {
          var line;
          if (!outmask) outmask = g.STANDARD;
          else if (outmask === g.LONG_UNROLL) outmask |= g.STANDARD;
          if (!arcmode) outmask |= g.DISTANCE_IN;
          line = new l.GeodesicLine(this, lat1, lon1, azi1, outmask);
          return line.GenPosition(arcmode, s12_a12, outmask);
        };
        g.Geodesic.prototype.Direct = function (lat1, lon1, azi1, s12, outmask) {
          return this.GenDirect(lat1, lon1, azi1, false, s12, outmask);
        };
        g.Geodesic.prototype.ArcDirect = function (lat1, lon1, azi1, a12, outmask) {
          return this.GenDirect(lat1, lon1, azi1, true, a12, outmask);
        };
        g.Geodesic.prototype.Line = function (lat1, lon1, azi1, caps) {
          return new l.GeodesicLine(this, lat1, lon1, azi1, caps);
        };
        g.Geodesic.prototype.DirectLine = function (lat1, lon1, azi1, s12, caps) {
          return this.GenDirectLine(lat1, lon1, azi1, false, s12, caps);
        };
        g.Geodesic.prototype.ArcDirectLine = function (lat1, lon1, azi1, a12, caps) {
          return this.GenDirectLine(lat1, lon1, azi1, true, a12, caps);
        };
        g.Geodesic.prototype.GenDirectLine = function (lat1, lon1, azi1, arcmode, s12_a12, caps) {
          var t;
          if (!caps) caps = g.STANDARD | g.DISTANCE_IN;
          if (!arcmode) caps |= g.DISTANCE_IN;
          t = new l.GeodesicLine(this, lat1, lon1, azi1, caps);
          t.GenSetDistance(arcmode, s12_a12);
          return t;
        };
        g.Geodesic.prototype.InverseLine = function (lat1, lon1, lat2, lon2, caps) {
          var r, t, azi1;
          if (!caps) caps = g.STANDARD | g.DISTANCE_IN;
          r = this.InverseInt(lat1, lon1, lat2, lon2, g.ARC);
          azi1 = m.atan2d(r.salp1, r.calp1);
          if (caps & (g.OUT_MASK & g.DISTANCE_IN)) caps |= g.DISTANCE;
          t = new l.GeodesicLine(this, lat1, lon1, azi1, caps, r.salp1, r.calp1);
          t.SetArc(r.vals.a12);
          return t;
        };
        g.Geodesic.prototype.Polygon = function (polyline) {
          return new p.PolygonArea(this, polyline);
        };
        g.WGS84 = new g.Geodesic(c.WGS84.a, c.WGS84.f);
      })(
        geodesic2.Geodesic,
        geodesic2.GeodesicLine,
        geodesic2.PolygonArea,
        geodesic2.Math,
        geodesic2.Constants,
      );
      (function (g, l, m) {
        'use strict';
        l.GeodesicLine = function (geod, lat1, lon1, azi1, caps, salp1, calp1) {
          var t, cbet1, sbet1, eps, s, c;
          if (!caps) caps = g.STANDARD | g.DISTANCE_IN;
          this.a = geod.a;
          this.f = geod.f;
          this._b = geod._b;
          this._c2 = geod._c2;
          this._f1 = geod._f1;
          this.caps = caps | g.LATITUDE | g.AZIMUTH | g.LONG_UNROLL;
          this.lat1 = m.LatFix(lat1);
          this.lon1 = lon1;
          if (typeof salp1 === 'undefined' || typeof calp1 === 'undefined') {
            this.azi1 = m.AngNormalize(azi1);
            t = m.sincosd(m.AngRound(this.azi1));
            this.salp1 = t.s;
            this.calp1 = t.c;
          } else {
            this.azi1 = azi1;
            this.salp1 = salp1;
            this.calp1 = calp1;
          }
          t = m.sincosd(m.AngRound(this.lat1));
          sbet1 = this._f1 * t.s;
          cbet1 = t.c;
          t = m.hypot(sbet1, cbet1);
          sbet1 /= t;
          cbet1 /= t;
          cbet1 = Math.max(g.tiny_, cbet1);
          this._dn1 = Math.sqrt(1 + geod._ep2 * m.sq(sbet1));
          this._salp0 = this.salp1 * cbet1;
          this._calp0 = m.hypot(this.calp1, this.salp1 * sbet1);
          this._ssig1 = sbet1;
          this._somg1 = this._salp0 * sbet1;
          this._csig1 = this._comg1 = sbet1 !== 0 || this.calp1 !== 0 ? cbet1 * this.calp1 : 1;
          t = m.hypot(this._ssig1, this._csig1);
          this._ssig1 /= t;
          this._csig1 /= t;
          this._k2 = m.sq(this._calp0) * geod._ep2;
          eps = this._k2 / (2 * (1 + Math.sqrt(1 + this._k2)) + this._k2);
          if (this.caps & g.CAP_C1) {
            this._A1m1 = g.A1m1f(eps);
            this._C1a = new Array(g.nC1_ + 1);
            g.C1f(eps, this._C1a);
            this._B11 = g.SinCosSeries(true, this._ssig1, this._csig1, this._C1a);
            s = Math.sin(this._B11);
            c = Math.cos(this._B11);
            this._stau1 = this._ssig1 * c + this._csig1 * s;
            this._ctau1 = this._csig1 * c - this._ssig1 * s;
          }
          if (this.caps & g.CAP_C1p) {
            this._C1pa = new Array(g.nC1p_ + 1);
            g.C1pf(eps, this._C1pa);
          }
          if (this.caps & g.CAP_C2) {
            this._A2m1 = g.A2m1f(eps);
            this._C2a = new Array(g.nC2_ + 1);
            g.C2f(eps, this._C2a);
            this._B21 = g.SinCosSeries(true, this._ssig1, this._csig1, this._C2a);
          }
          if (this.caps & g.CAP_C3) {
            this._C3a = new Array(g.nC3_);
            geod.C3f(eps, this._C3a);
            this._A3c = -this.f * this._salp0 * geod.A3f(eps);
            this._B31 = g.SinCosSeries(true, this._ssig1, this._csig1, this._C3a);
          }
          if (this.caps & g.CAP_C4) {
            this._C4a = new Array(g.nC4_);
            geod.C4f(eps, this._C4a);
            this._A4 = m.sq(this.a) * this._calp0 * this._salp0 * geod._e2;
            this._B41 = g.SinCosSeries(false, this._ssig1, this._csig1, this._C4a);
          }
          this.a13 = this.s13 = NaN;
        };
        l.GeodesicLine.prototype.GenPosition = function (arcmode, s12_a12, outmask) {
          var vals = {},
            sig12,
            ssig12,
            csig12,
            B12,
            AB1,
            ssig2,
            csig2,
            tau12,
            s,
            c,
            serr,
            omg12,
            lam12,
            lon12,
            E,
            sbet2,
            cbet2,
            somg2,
            comg2,
            salp2,
            calp2,
            dn2,
            B22,
            AB2,
            J12,
            t,
            B42,
            salp12,
            calp12;
          if (!outmask) outmask = g.STANDARD;
          else if (outmask === g.LONG_UNROLL) outmask |= g.STANDARD;
          outmask &= this.caps & g.OUT_MASK;
          vals.lat1 = this.lat1;
          vals.azi1 = this.azi1;
          vals.lon1 = outmask & g.LONG_UNROLL ? this.lon1 : m.AngNormalize(this.lon1);
          if (arcmode) vals.a12 = s12_a12;
          else vals.s12 = s12_a12;
          if (!(arcmode || this.caps & g.DISTANCE_IN & g.OUT_MASK)) {
            vals.a12 = NaN;
            return vals;
          }
          B12 = 0;
          AB1 = 0;
          if (arcmode) {
            sig12 = s12_a12 * m.degree;
            t = m.sincosd(s12_a12);
            ssig12 = t.s;
            csig12 = t.c;
          } else {
            tau12 = s12_a12 / (this._b * (1 + this._A1m1));
            s = Math.sin(tau12);
            c = Math.cos(tau12);
            B12 = -g.SinCosSeries(
              true,
              this._stau1 * c + this._ctau1 * s,
              this._ctau1 * c - this._stau1 * s,
              this._C1pa,
            );
            sig12 = tau12 - (B12 - this._B11);
            ssig12 = Math.sin(sig12);
            csig12 = Math.cos(sig12);
            if (Math.abs(this.f) > 0.01) {
              ssig2 = this._ssig1 * csig12 + this._csig1 * ssig12;
              csig2 = this._csig1 * csig12 - this._ssig1 * ssig12;
              B12 = g.SinCosSeries(true, ssig2, csig2, this._C1a);
              serr = (1 + this._A1m1) * (sig12 + (B12 - this._B11)) - s12_a12 / this._b;
              sig12 = sig12 - serr / Math.sqrt(1 + this._k2 * m.sq(ssig2));
              ssig12 = Math.sin(sig12);
              csig12 = Math.cos(sig12);
            }
          }
          ssig2 = this._ssig1 * csig12 + this._csig1 * ssig12;
          csig2 = this._csig1 * csig12 - this._ssig1 * ssig12;
          dn2 = Math.sqrt(1 + this._k2 * m.sq(ssig2));
          if (outmask & (g.DISTANCE | g.REDUCEDLENGTH | g.GEODESICSCALE)) {
            if (arcmode || Math.abs(this.f) > 0.01)
              B12 = g.SinCosSeries(true, ssig2, csig2, this._C1a);
            AB1 = (1 + this._A1m1) * (B12 - this._B11);
          }
          sbet2 = this._calp0 * ssig2;
          cbet2 = m.hypot(this._salp0, this._calp0 * csig2);
          if (cbet2 === 0) cbet2 = csig2 = g.tiny_;
          salp2 = this._salp0;
          calp2 = this._calp0 * csig2;
          if (arcmode && outmask & g.DISTANCE)
            vals.s12 = this._b * ((1 + this._A1m1) * sig12 + AB1);
          if (outmask & g.LONGITUDE) {
            somg2 = this._salp0 * ssig2;
            comg2 = csig2;
            E = m.copysign(1, this._salp0);
            omg12 =
              outmask & g.LONG_UNROLL
                ? E *
                  (sig12 -
                    (Math.atan2(ssig2, csig2) - Math.atan2(this._ssig1, this._csig1)) +
                    (Math.atan2(E * somg2, comg2) - Math.atan2(E * this._somg1, this._comg1)))
                : Math.atan2(
                    somg2 * this._comg1 - comg2 * this._somg1,
                    comg2 * this._comg1 + somg2 * this._somg1,
                  );
            lam12 =
              omg12 +
              this._A3c * (sig12 + (g.SinCosSeries(true, ssig2, csig2, this._C3a) - this._B31));
            lon12 = lam12 / m.degree;
            vals.lon2 =
              outmask & g.LONG_UNROLL
                ? this.lon1 + lon12
                : m.AngNormalize(m.AngNormalize(this.lon1) + m.AngNormalize(lon12));
          }
          if (outmask & g.LATITUDE) vals.lat2 = m.atan2d(sbet2, this._f1 * cbet2);
          if (outmask & g.AZIMUTH) vals.azi2 = m.atan2d(salp2, calp2);
          if (outmask & (g.REDUCEDLENGTH | g.GEODESICSCALE)) {
            B22 = g.SinCosSeries(true, ssig2, csig2, this._C2a);
            AB2 = (1 + this._A2m1) * (B22 - this._B21);
            J12 = (this._A1m1 - this._A2m1) * sig12 + (AB1 - AB2);
            if (outmask & g.REDUCEDLENGTH)
              vals.m12 =
                this._b *
                (dn2 * (this._csig1 * ssig2) -
                  this._dn1 * (this._ssig1 * csig2) -
                  this._csig1 * csig2 * J12);
            if (outmask & g.GEODESICSCALE) {
              t = (this._k2 * (ssig2 - this._ssig1) * (ssig2 + this._ssig1)) / (this._dn1 + dn2);
              vals.M12 = csig12 + ((t * ssig2 - csig2 * J12) * this._ssig1) / this._dn1;
              vals.M21 = csig12 - ((t * this._ssig1 - this._csig1 * J12) * ssig2) / dn2;
            }
          }
          if (outmask & g.AREA) {
            B42 = g.SinCosSeries(false, ssig2, csig2, this._C4a);
            if (this._calp0 === 0 || this._salp0 === 0) {
              salp12 = salp2 * this.calp1 - calp2 * this.salp1;
              calp12 = calp2 * this.calp1 + salp2 * this.salp1;
            } else {
              salp12 =
                this._calp0 *
                this._salp0 *
                (csig12 <= 0
                  ? this._csig1 * (1 - csig12) + ssig12 * this._ssig1
                  : ssig12 * ((this._csig1 * ssig12) / (1 + csig12) + this._ssig1));
              calp12 = m.sq(this._salp0) + m.sq(this._calp0) * this._csig1 * csig2;
            }
            vals.S12 = this._c2 * Math.atan2(salp12, calp12) + this._A4 * (B42 - this._B41);
          }
          if (!arcmode) vals.a12 = sig12 / m.degree;
          return vals;
        };
        l.GeodesicLine.prototype.Position = function (s12, outmask) {
          return this.GenPosition(false, s12, outmask);
        };
        l.GeodesicLine.prototype.ArcPosition = function (a12, outmask) {
          return this.GenPosition(true, a12, outmask);
        };
        l.GeodesicLine.prototype.GenSetDistance = function (arcmode, s13_a13) {
          if (arcmode) this.SetArc(s13_a13);
          else this.SetDistance(s13_a13);
        };
        l.GeodesicLine.prototype.SetDistance = function (s13) {
          var r;
          this.s13 = s13;
          r = this.GenPosition(false, this.s13, g.ARC);
          this.a13 = 0 + r.a12;
        };
        l.GeodesicLine.prototype.SetArc = function (a13) {
          var r;
          this.a13 = a13;
          r = this.GenPosition(true, this.a13, g.DISTANCE);
          this.s13 = 0 + r.s12;
        };
      })(geodesic2.Geodesic, geodesic2.GeodesicLine, geodesic2.Math);
      (function (p, g, m, a) {
        'use strict';
        var transit, transitdirect, AreaReduceA, AreaReduceB;
        transit = function (lon1, lon2) {
          var lon12 = m.AngDiff(lon1, lon2).d;
          lon1 = m.AngNormalize(lon1);
          lon2 = m.AngNormalize(lon2);
          return lon12 > 0 && ((lon1 < 0 && lon2 >= 0) || (lon1 > 0 && lon2 === 0))
            ? 1
            : lon12 < 0 && lon1 >= 0 && lon2 < 0
              ? -1
              : 0;
        };
        transitdirect = function (lon1, lon2) {
          lon1 = lon1 % 720;
          lon2 = lon2 % 720;
          return (
            ((0 <= lon2 && lon2 < 360) || lon2 < -360 ? 0 : 1) -
            ((0 <= lon1 && lon1 < 360) || lon1 < -360 ? 0 : 1)
          );
        };
        AreaReduceA = function (area, area0, crossings, reverse, sign) {
          area.Remainder(area0);
          if (crossings & 1) area.Add(((area.Sum() < 0 ? 1 : -1) * area0) / 2);
          if (!reverse) area.Negate();
          if (sign) {
            if (area.Sum() > area0 / 2) area.Add(-area0);
            else if (area.Sum() <= -area0 / 2) area.Add(+area0);
          } else {
            if (area.Sum() >= area0) area.Add(-area0);
            else if (area.Sum() < 0) area.Add(+area0);
          }
          return 0 + area.Sum();
        };
        AreaReduceB = function (area, area0, crossings, reverse, sign) {
          area = m.remainder(area, area0);
          if (crossings & 1) area += ((area < 0 ? 1 : -1) * area0) / 2;
          if (!reverse) area *= -1;
          if (sign) {
            if (area > area0 / 2) area -= area0;
            else if (area <= -area0 / 2) area += area0;
          } else {
            if (area >= area0) area -= area0;
            else if (area < 0) area += area0;
          }
          return 0 + area;
        };
        p.PolygonArea = function (geod, polyline) {
          this._geod = geod;
          this.a = this._geod.a;
          this.f = this._geod.f;
          this._area0 = 4 * Math.PI * geod._c2;
          this.polyline = !polyline ? false : polyline;
          this._mask =
            g.LATITUDE |
            g.LONGITUDE |
            g.DISTANCE |
            (this.polyline ? g.NONE : g.AREA | g.LONG_UNROLL);
          if (!this.polyline) this._areasum = new a.Accumulator(0);
          this._perimetersum = new a.Accumulator(0);
          this.Clear();
        };
        p.PolygonArea.prototype.Clear = function () {
          this.num = 0;
          this._crossings = 0;
          if (!this.polyline) this._areasum.Set(0);
          this._perimetersum.Set(0);
          this._lat0 = this._lon0 = this.lat = this.lon = NaN;
        };
        p.PolygonArea.prototype.AddPoint = function (lat, lon) {
          var t;
          if (this.num === 0) {
            this._lat0 = this.lat = lat;
            this._lon0 = this.lon = lon;
          } else {
            t = this._geod.Inverse(this.lat, this.lon, lat, lon, this._mask);
            this._perimetersum.Add(t.s12);
            if (!this.polyline) {
              this._areasum.Add(t.S12);
              this._crossings += transit(this.lon, lon);
            }
            this.lat = lat;
            this.lon = lon;
          }
          ++this.num;
        };
        p.PolygonArea.prototype.AddEdge = function (azi, s) {
          var t;
          if (this.num) {
            t = this._geod.Direct(this.lat, this.lon, azi, s, this._mask);
            this._perimetersum.Add(s);
            if (!this.polyline) {
              this._areasum.Add(t.S12);
              this._crossings += transitdirect(this.lon, t.lon2);
            }
            this.lat = t.lat2;
            this.lon = t.lon2;
          }
          ++this.num;
        };
        p.PolygonArea.prototype.Compute = function (reverse, sign) {
          var vals = { number: this.num },
            t,
            tempsum;
          if (this.num < 2) {
            vals.perimeter = 0;
            if (!this.polyline) vals.area = 0;
            return vals;
          }
          if (this.polyline) {
            vals.perimeter = this._perimetersum.Sum();
            return vals;
          }
          t = this._geod.Inverse(this.lat, this.lon, this._lat0, this._lon0, this._mask);
          vals.perimeter = this._perimetersum.Sum(t.s12);
          tempsum = new a.Accumulator(this._areasum);
          tempsum.Add(t.S12);
          vals.area = AreaReduceA(
            tempsum,
            this._area0,
            this._crossings + transit(this.lon, this._lon0),
            reverse,
            sign,
          );
          return vals;
        };
        p.PolygonArea.prototype.TestPoint = function (lat, lon, reverse, sign) {
          var vals = { number: this.num + 1 },
            t,
            tempsum,
            crossings,
            i;
          if (this.num === 0) {
            vals.perimeter = 0;
            if (!this.polyline) vals.area = 0;
            return vals;
          }
          vals.perimeter = this._perimetersum.Sum();
          tempsum = this.polyline ? 0 : this._areasum.Sum();
          crossings = this._crossings;
          for (i = 0; i < (this.polyline ? 1 : 2); ++i) {
            t = this._geod.Inverse(
              i === 0 ? this.lat : lat,
              i === 0 ? this.lon : lon,
              i !== 0 ? this._lat0 : lat,
              i !== 0 ? this._lon0 : lon,
              this._mask,
            );
            vals.perimeter += t.s12;
            if (!this.polyline) {
              tempsum += t.S12;
              crossings += transit(i === 0 ? this.lon : lon, i !== 0 ? this._lon0 : lon);
            }
          }
          if (this.polyline) return vals;
          vals.area = AreaReduceB(tempsum, this._area0, crossings, reverse, sign);
          return vals;
        };
        p.PolygonArea.prototype.TestEdge = function (azi, s, reverse, sign) {
          var vals = { number: this.num ? this.num + 1 : 0 },
            t,
            tempsum,
            crossings;
          if (this.num === 0) return vals;
          vals.perimeter = this._perimetersum.Sum() + s;
          if (this.polyline) return vals;
          tempsum = this._areasum.Sum();
          crossings = this._crossings;
          t = this._geod.Direct(this.lat, this.lon, azi, s, this._mask);
          tempsum += t.S12;
          crossings += transitdirect(this.lon, t.lon2);
          crossings += transit(t.lon2, this._lon0);
          t = this._geod.Inverse(t.lat2, t.lon2, this._lat0, this._lon0, this._mask);
          vals.perimeter += t.s12;
          tempsum += t.S12;
          vals.area = AreaReduceB(tempsum, this._area0, crossings, reverse, sign);
          return vals;
        };
      })(geodesic2.PolygonArea, geodesic2.Geodesic, geodesic2.Math, geodesic2.Accumulator);
      cb(geodesic2);
    })(function (geo) {
      if (typeof module === 'object' && module.exports) {
        module.exports = geo;
      } else if (typeof define === 'function' && define.amd) {
        define('geographiclib-geodesic', [], function () {
          return geo;
        });
      } else {
        window.geodesic = geo;
      }
    });
  },
});

// scripts/vendor-entry.js
var import_polygon_clipping = __toESM(require_polygon_clipping_umd(), 1);
var import_geographiclib_geodesic = __toESM(require_geographiclib_geodesic_min(), 1);
var union = import_polygon_clipping.default.union;
var geodesic = import_geographiclib_geodesic.default.Geodesic.WGS84;
export { geodesic, union };
/*! Bundled license information:

polygon-clipping/dist/polygon-clipping.umd.js:
  (**
   * splaytree v3.1.2
   * Fast Splay tree for Node and browser
   *
   * @author Alexander Milevski <info@w8r.name>
   * @license MIT
   * @preserve
   *)
  (*! *****************************************************************************
      Copyright (c) Microsoft Corporation. All rights reserved.
      Licensed under the Apache License, Version 2.0 (the "License"); you may not use
      this file except in compliance with the License. You may obtain a copy of the
      License at http://www.apache.org/licenses/LICENSE-2.0
  
      THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
      KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
      WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
      MERCHANTABLITY OR NON-INFRINGEMENT.
  
      See the Apache Version 2.0 License for specific language governing permissions
      and limitations under the License.
      ***************************************************************************** *)
*/
