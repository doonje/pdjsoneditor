export function toCamelCase(str: string): string {
	return str
		.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
			return index === 0 ? word.toLowerCase() : word.toUpperCase();
		})
		.replace(/\s+|_|-|\./g, '');
}

export function toPascalCase(str: string): string {
	return str
		.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => {
			return word.toUpperCase();
		})
		.replace(/\s+|_|-|\./g, '');
}

export function toSnakeCase(str: string): string {
	return str
		.replace(/([A-Z])/g, '_$1')
		.replace(/\s+|-|\./g, '_')
		.replace(/^_/, '')
		.toLowerCase();
}

export function toKebabCase(str: string): string {
	return str
		.replace(/([A-Z])/g, '-$1')
		.replace(/\s+|_|\./g, '-')
		.replace(/^-/, '')
		.toLowerCase();
}

export function toScreamingSnakeCase(str: string): string {
	return toSnakeCase(str).toUpperCase();
}

export function toDotCase(str: string): string {
	return str
		.replace(/([A-Z])/g, '.$1')
		.replace(/\s+|_|-/g, '.')
		.replace(/^\./, '')
		.toLowerCase();
}

export function toPathCase(str: string): string {
	return str
		.replace(/([A-Z])/g, '/$1')
		.replace(/\s+|_|-|\./g, '/')
		.replace(/^\//, '')
		.toLowerCase();
}
