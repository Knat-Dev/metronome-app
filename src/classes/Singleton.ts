type SingletonConstructor<T extends Singleton> = { new (): T };

export abstract class Singleton {
	private static _instanceMap: Map<SingletonConstructor<Singleton>, Singleton> = new Map();

	static getInstance<T extends Singleton>(this: SingletonConstructor<T>): T {
		if (!Singleton._instanceMap.has(this)) {
			Singleton._instanceMap.set(this, new this());
		}
		return Singleton._instanceMap.get(this) as T;
	}

	protected constructor() {
		// initialization
	}
}
