make install:
	npm install

dev:
	DEBUG=app* npx nodemon --watch .  --ext '.js' --exec npx gulp start

prod:
	npm start

build:
	rm -rf public
	npm run build

test:
	DEBUG=app* npm test

test-watch:
	npm test -- --watchAll

test-coverage:
	npm test -- --coverage

lint:
	npx eslint .

clean:
	rm -rf public

.PHONY: test
