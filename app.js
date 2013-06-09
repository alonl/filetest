// Some basic boilerplate stuff
var express = require("express"),
    app = express(),
    Article = require("./Article");   // I encapsulated my data objects in a dedicated class

app.configure("development", function () {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure("production", function () {
    app.use(express.errorHandler());
});

app.use(express["static"](__dirname + "/static"));
app.use(express.bodyParser());

// Routes
// list all articles
app.get("/articles", function (req, res) {
    Article.findAll(function (error, results) {
        if (error) {
            res.json(error, 400);
        } else if (!results) {
            res.send(404);
        } else {
            var i = 0, stop = results.length;

            for (i; i < stop; i++) {
                results[i].image = undefined;
            }

            res.json(results);
        }
    });
});

// get the JSON representation of just one article
app.get("/article/:id", function (req, res) {
    Article.findById(req.params.id, function (error, result) {
        if (error) {
            res.json(error, 400);
        } else if (!result) {
            res.send(404);
        } else {
            result.image = undefined;
            res.json(result);
        }
    });
});

// get the image of a particular article
app.get("/article/:id/image", function (req, res) {
    Article.findById(req.params.id, function (error, result) {
        if (error) {
            res.json(error, 400);
        } else if (!result || !result.imageType || !result.image || !result.image.buffer || !result.image.buffer.length) {
            res.send(404);
        } else {
            res.contentType(result.imageType);
            res.end(result.image.buffer, "binary");
        }
    });
});

// save/update a new article
app.post("/article", function (req, res, next) {
    var input = req.body;

    if (!input.author) {
        res.json("author must be specified when saving a new article", 400);
        return;
    } 

    if (!input.content) {
        res.json("content must be specified when saving a new article", 400);
        return;
    } 

    Article.save(input, req.files.image, function (err, objects) {
        if (err) {
            res.json(error, 400);
        } else if (objects === 1) {     //update
            input.image = undefined;
            res.json(input, 200);
        } else {                        //insert
            input.image = undefined;
            res.json(input, 201);
        }
    });
});

app.listen(3000);
console.log("Express server listening on port bla bla!!!");