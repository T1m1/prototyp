function GeneralConnection(fromObj, toObj) {
    this.fromObj = fromObj;
    this.toObj = toObj;
}

GeneralConnection.prototype.render = function() {
    var fromObj = this.fromObj;
    var toObj = this.toObj;
    var fromPos = fromObj.obj.position;
    var toPos = toObj.obj.position;

    var points = {};
    if(this._isVertical(fromPos, toPos)) {
        points = this._verticalCalculation(fromObj, toObj, fromPos, toPos);
    } else if (this._isHorizontal(fromObj.height, toObj.height, fromPos, toPos)) {
        points = this._horizontalCalculation(fromObj, toObj, fromPos, toPos);
    } else {
        points = this._diagonalCalculation(fromObj, toObj, fromPos, toPos);
    }

    // startpoint
    points.coord = this._createPoint((toPos.x < fromPos.x) ? toPos.x : fromPos.x,
        (toPos.x < fromPos.x) ? toPos.y - toObj.height/2 : fromPos.y - fromObj.height/2);

    return points;
};

GeneralConnection.prototype._verticalCalculation = function(fromObj, toObj, fromPos, toPos) {
    var y = this._absoluteSubtraction(fromPos.y, toPos.y);
    var yStart =  this._isToGreater(toPos, fromPos) ? -(fromObj.height/2) : fromObj.height/2;
    var yEnd = this._isToGreater(toPos, fromPos) ? -(y-toObj.height/2) : y - toObj.height/2;

    // start placing
    return {
        l1: this._createPoint(0, yStart),
        l2: this._createPoint(0, yEnd),
        distance: yStart-yEnd
    };
};

GeneralConnection.prototype._horizontalCalculation = function(fromObj, toObj, fromPos, toPos) {
    var widthLeft = (toPos.x > fromPos.x) ? fromObj.width/2 : toObj.width/2;
    var widthRight = (toPos.x < fromPos.x) ? fromObj.width/2 : toObj.width/2;
    var rightX = this._absoluteSubtraction(fromPos.x, toPos.x) - widthRight;

    return {
        l1: this._createPoint(0, widthLeft),
        l2: this._createPoint(0, rightX ),
        distance: widthLeft - rightX,
        angle: -1.5708 // 90 degrees
    };
};

GeneralConnection.prototype._diagonalCalculation = function(fromObj, toObj, fromPos, toPos) {
    var a = this._absoluteSubtraction(fromPos.x, toPos.x);
    var b = this._absoluteSubtraction(fromPos.y - fromObj.height/2, toPos.y - toObj.height/2);
    var c = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));

    var alpha = Math.atan(a/b);

    var fromAlpha = Math.atan(fromObj.width / fromObj.height); // right order? => I think so
    var toAlpha = Math.atan(toObj.width / toObj.height);

    var fromC, toC;
    if(alpha < fromAlpha) {
        fromC = (fromObj.height / 2) / Math.cos(alpha);
    } else {
        fromC = (fromObj.width / 2) / Math.sin(alpha);
    }

    if(alpha < toAlpha) {
      toC = (toObj.height / 2) / Math.cos(alpha);
    } else {
      toC = (toObj.width / 2) / Math.sin(alpha);
    }

    var yStart, yEnd;
    if(fromPos.x < toPos.x) {
      yStart = fromC;
      yEnd = c - toC;
    } else {
      yStart = toC;
      yEnd = c - fromC;
    }

    // create points for polyline
    var line = {
        l1: this._createPoint(0, toIsGreater() ? yStart : -yStart),
        l2: this._createPoint(0, toIsGreater() ? yEnd : -yEnd),
    };
    line.distance = this._absoluteSubtraction(line.l1.y, line.l2.y);

    // Add angle
    line.angle = toIsGreater() ? -alpha : alpha;
    return line;

    function pythagorasTheorem(a, b) {
        return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
    }

    function calculateDiagonalPoints(alpha, height1, height2) {
        var h = (fromPos.x < toPos.x) ? height1 : height2;
        return {
            h: h,
            d: (a < b) ? Math.tan(alpha) * h : h / Math.sin(alpha)
        };
    }

    function toIsGreater() {
        if(toPos.x > fromPos.x) {
            return (toPos.y-toObj.height/2) > (fromPos.y-fromObj.height/2);
        } else {
            return (toPos.y-toObj.height/2) < (fromPos.y-fromObj.height/2);
        }
    }
}

GeneralConnection.prototype._createPoint = function(x, y) {
    return { x: x, y: y };
}

GeneralConnection.prototype._isToGreater = function(toPos, fromPos) {
    return (toPos.x > fromPos.x) ? toPos.y > fromPos.y : toPos.y < fromPos.y;
};

GeneralConnection.prototype._absoluteSubtraction = function(num1, num2) {
    return Math.abs(num1-num2);
};

GeneralConnection.prototype._isVertical = function(fromPos, toPos) {
    return fromPos.x == toPos.x;
}

GeneralConnection.prototype._isHorizontal = function(fromHeight, toHeight, fromPos, toPos) {
    return (fromPos.y - fromHeight/2) == (toPos.y - toHeight/2);
}
