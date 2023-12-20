import assert from 'assert'

const input = await Bun.file(`${import.meta.dir}/../../../input/20.txt`).text();

const parseInput = (input: string) => {
	const modules: Module[] = input
		.trim()
		.split('\n')
		.map((line) => {
			const [module, destinationsString] = line.split(' -> ')
			const name = '%&'.includes(module[0]) ? module.slice(1) : module
			const destinations = destinationsString.split(', ')
			switch (module[0]) {
				case '%':
					return {
						name,
						destinations,
						type: 'flipflop',
						on: false,
					} as FlipFlop
				case '&':
					return {
						name,
						destinations,
						type: 'conjunction',
						inputList: [],
						lastInputs: [],
					} as Conjunction
				default:
					return { name, destinations } as Broadcaster
			}
		})
	for (const module of modules) {
		if (module.type === 'conjunction') {
			const inputs = modules.filter((m) => m.destinations.includes(module.name))
			module.inputList = inputs.map((i) => i.name)
			module.lastInputs = inputs.map((_) => 'low')
		}
	}
	return modules
}

type Pulse = 'high' | 'low'
type BaseModule = {
	name: string
	destinations: string[]
}
type Broadcaster = BaseModule & { type: 'broadcaster' }
type FlipFlop = BaseModule & { type: 'flipflop'; on: boolean }
type Conjunction = BaseModule & {
	type: 'conjunction'
	inputList: string[]
	lastInputs: Pulse[]
}
type Module = Broadcaster | FlipFlop | Conjunction
type SentPulse = [Module, Pulse, string]

function getInitialPulses(getModule: (name: string) => Module): SentPulse[] {
	const broadcaster = getModule('broadcaster')
	return broadcaster.destinations.map((d) => [getModule(d), 'low', 'broadcaster'])
}

function getSentPulses(
	[module, pulse, from]: SentPulse,
	getModule: (name: string) => Module
) {
	assert(module.type !== 'broadcaster')
	let pulseType: Pulse
	if (module.type === 'conjunction') {
		const inputIndex = module.inputList.indexOf(from)
		module.lastInputs[inputIndex] = pulse
		pulseType = module.lastInputs.every((i) => i === 'high') ? 'low' : 'high'
	} else if (pulse === 'low') {
			module.on = !module.on
			pulseType = module.on ? 'high' : 'low'
  } else {
    return false
  }
	const toPulse = module.destinations.map(
		(d) => [getModule(d), pulseType, module.name] as SentPulse
	)
	return {
		pulseCount: toPulse.length,
		pulseType,
		pulses: toPulse.filter((p) => p[0]),
	}
}

const part1 = (input: string): string | number => {
	const modules = parseInput(input)
	const getModule = (name: string) => modules.find((m) => m.name === name)!
	const initialPulses = getInitialPulses(getModule)
	const pulses = { high: 0, low: 0 }
	for (let i = 0; i < 1000; i++) {
		let pulsedModules: SentPulse[] = initialPulses
		pulses.low += 1 + pulsedModules.length
		while (pulsedModules.length > 0) {
			const nextPulsedModules: SentPulse[] = []
			for (const pulsedModule of pulsedModules) {
				const sentPulses = getSentPulses(pulsedModule, getModule)
				if (!sentPulses) continue
				pulses[sentPulses.pulseType] += sentPulses.pulseCount
				nextPulsedModules.push(...sentPulses.pulses)
			}
			pulsedModules = nextPulsedModules
		}
	}
	return pulses.low * pulses.high
}

const greatestCommonDivisorOf2 = (a: number, b: number) => {
	while (b) {
		const bb = b
		b = a % b
		a = bb
	}
	return a
}

const leastCommonMultipleOf2 = (a: number, b: number) =>
	Math.abs(a * b) / greatestCommonDivisorOf2(a, b)

const leastCommonMultiple = (...array: number[]) =>
	array.reduce((a, c) => leastCommonMultipleOf2(a, c), 1)

export const part2 = (input: string): string | number => {
	const modules = parseInput(input)
	const getModule = (name: string) => modules.find((m) => m.name === name)!
	const initialPulses = getInitialPulses(getModule)
	const rxInput = modules.find((m) => m.destinations.includes('rx'))!
	const sendsToRxInputs = modules.filter((m) => m.destinations.includes(rxInput.name))
	const cycles: Map<string, number> = new Map()
	let buttonPresses = 0
	while (true) {
		buttonPresses++
		let pulsedModules: SentPulse[] = initialPulses
		while (pulsedModules.length > 0) {
			const nextPulsedModules: SentPulse[] = []
			for (const pulsedModule of pulsedModules) {
				const sentPulses = getSentPulses(pulsedModule, getModule)
				if (!sentPulses) continue
				for (const [toModule, pulseType] of sentPulses.pulses) {
					if (pulseType === 'high' && toModule === rxInput) {
						if (!cycles.has(pulsedModule[0].name)) {
							cycles.set(pulsedModule[0].name, buttonPresses)
							if (cycles.size === sendsToRxInputs.length) {
								return leastCommonMultiple(...cycles.values())
							}
						}
					}
				}
				nextPulsedModules.push(...sentPulses.pulses)
			}
			pulsedModules = nextPulsedModules
		}
	}
}

export const partone = part1(input);
export const parttwo = part2(input);

