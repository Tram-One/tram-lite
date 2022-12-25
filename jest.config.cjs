module.exports = {
	setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
	testEnvironment: 'jsdom',
	transform: {
		'^.+\\.ts?$': 'ts-jest',
	},
	moduleFileExtensions: ['ts', 'js'],
};
