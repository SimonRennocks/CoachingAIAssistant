const router = require("express").Router();

router.get("/data", (req, res) => {
    const testdata = { test: "test api" };
    res.json(testdata);
});

module.exports = router;