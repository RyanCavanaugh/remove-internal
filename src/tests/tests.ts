import path = require('path');
import fs = require('fs');
import self = require('../index');

test("matches the baseline files", () => {
    const testDir = path.join(__dirname, '../../testcases');
    const files = fs.readdirSync(testDir);
    for (const test of files) {
        const fn = path.join(testDir, test);
        const fileContent = fs.readFileSync(fn, { encoding: 'utf-8' });
        const elided = self.elide(fileContent).result;
        expect(elided).toMatchSnapshot(test);
    }
});
