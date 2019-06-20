// Custom component to handle wheel spinning
@Component('wheelSpin')
export class WheelSpin {
  id: number
  active: boolean = false
  speed: number = 30
  direction: Vector3 = Vector3.Up()
  constructor(id:number){
	this.id = id
  }
}

// This group keeps track of all entities with a WheelSpin component
const wheels = engine.getComponentGroup(WheelSpin)


// a message bus to sync state for all players
const sceneMessageBus = new MessageBus()


/// --- Define a custom type to pass in messages ---
type WheelState = {
	id: number,
	active: boolean,
	speed: number
  };

type AllWheelsState = {wheels:[
	WheelState]
  };



// This system carries out the rotation on each frame
export class RotatorSystem implements ISystem {
 
  update(dt: number) {
    // iterate over the wheels in the component group
    for (let wheel of wheels.entities) {
      // handy shortcuts
      let spin = wheel.getComponent(WheelSpin)
      let transform = wheel.getComponent(Transform)
      // check state
      if (spin.active){
        // spin the wheel
        transform.rotate(spin.direction, spin.speed * dt)
      }
    }
  }
}

// Add system to engine
engine.addSystem(new RotatorSystem())


// Environment
let stage = new Entity()
stage.addComponent(new GLTFShape("models/Theatre.glb"))
stage.addComponent(new Transform({
  position: new Vector3(8, 0, 8),
  rotation: Quaternion.Euler(0, 270, 0)
}))
engine.addEntity(stage)

// Define a reusable Cylinder shape component
let CylinderWCollisions = new CylinderShape()
CylinderWCollisions.withCollisions = true

// Create wheel entities
let wheel1 = new Entity()
wheel1.addComponent(CylinderWCollisions)
wheel1.addComponent(new Transform({
  position: new Vector3(6, 2, 11.9),
  rotation: Quaternion.Euler(90, 0, 0),
  scale: new Vector3(1, 0.05, 1)
}))
engine.addEntity(wheel1)

let wheel2 = new Entity()
wheel2.addComponent(CylinderWCollisions)
wheel2.addComponent(new Transform({
  position: new Vector3(10, 2, 11.9),
  rotation: Quaternion.Euler(90, 0, 0),
  scale: new Vector3(1, 0.05, 1)
}))
engine.addEntity(wheel2)

// Create texture
const spiralTexture = new Texture("materials/hypno-wheel.png")

// Create material
let spiralMaterial = new Material()
spiralMaterial.albedoTexture = spiralTexture

// Add material to wheels
wheel1.addComponent(spiralMaterial)
wheel2.addComponent(spiralMaterial)

// Add the custom component to the wheels
wheel1.addComponent(new WheelSpin(1))
wheel2.addComponent(new WheelSpin(2))

// Change the direction for wheel2 (wheel1 is left with the default direction `Up`)
wheel2.getComponent(WheelSpin).direction = Vector3.Down()

// Set the click behavior for the wheels
wheel1.addComponent(
  new OnClick(e => {
    emitState(1)
  })
)

wheel2.addComponent(
  new OnClick(e => {
    emitState(2)
  })
)

function emitState(id: number = null){
	
	let wheelsList = []
	for (let wheel of wheels.entities) {
		let spin = wheel.getComponent(WheelSpin)
		let wheelState: WheelState = {
			id : spin.id,
			active : spin.active,
			speed : spin.speed
		}
		if (wheelState.id == id){
			if (!wheelState.active){
				wheelState.active = true
			  } else {
				wheelState.speed += 30
			  }
		}

		wheelsList.push(wheelState)
	  }
	sceneMessageBus.emit("spinningWheels", {wheels: wheelsList})
}

sceneMessageBus.on("spinningWheels", (info:AllWheelsState) => {
	for (let wheel of wheels.entities) {
		let spin = wheel.getComponent(WheelSpin)
		for (let w of info.wheels) {
			if (spin.id == w.id){
				spin.active = w.active
				spin.speed = w.speed
			}
		}
	}
  });



  // To get the initial state of the scene when joining
  sceneMessageBus.emit("getWheelState",{})
  
  // To return the initial state of the scene to new players
  sceneMessageBus.on("getWheelState", () => {
	emitState()
  });
  

