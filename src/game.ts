// Custom component to handle wheel spinning
@Component('wheelSpin')
export class WheelSpin {
  active: boolean = false
  speed: number = 30
  direction: Vector3 = Vector3.Up()
}

// This group keeps track of all entities with a WheelSpin component
const wheels = engine.getComponentGroup(WheelSpin)

// This system carries out the rotation on each frame
export class RotatorSystem implements ISystem {
  update(dt: number) {
    // iterate over the wheels in the component group
    for (const wheel of wheels.entities) {
      // handy shortcuts
      const spin = wheel.getComponent(WheelSpin)
      const transform = wheel.getComponent(Transform)
      // check state
      if (spin.active) {
        // spin the wheel
        transform.rotate(spin.direction, spin.speed * dt)
      }
    }
  }
}

// Add system to engine
engine.addSystem(new RotatorSystem())

// Environment
const stage = new Entity()
stage.addComponent(new GLTFShape('models/Theatre.glb'))
stage.addComponent(
  new Transform({
    position: new Vector3(8, 0, 8),
    rotation: Quaternion.Euler(0, 270, 0),
    scale: new Vector3(0.9, 1, 0.9)
  })
)
engine.addEntity(stage)

// Create wheel entities
const wheel1 = new Entity()
wheel1.addComponent(new CylinderShape())
wheel1.addComponent(
  new Transform({
    position: new Vector3(6, 2, 11.1),
    rotation: Quaternion.Euler(90, 0, 0),
    scale: new Vector3(1, 0.05, 1)
  })
)
engine.addEntity(wheel1)

const wheel2 = new Entity()
wheel2.addComponent(new CylinderShape())

wheel2.addComponent(
  new Transform({
    position: new Vector3(9.8, 2, 11.5),
    rotation: Quaternion.Euler(90, 0, 0),
    scale: new Vector3(1, 0.05, 1)
  })
)

engine.addEntity(wheel2)

// Create texture
const spiralTexture = new Texture('materials/hypno-wheel.png')

// Create material
const spiralMaterial = new Material()
spiralMaterial.albedoTexture = spiralTexture

// Add material to wheels
wheel1.addComponent(spiralMaterial)
wheel2.addComponent(spiralMaterial)

// Add the custom component to the wheels
wheel1.addComponent(new WheelSpin())
wheel2.addComponent(new WheelSpin())

// Change the direction for wheel2 (wheel1 is left with the default direction `Up`)
wheel2.getComponent(WheelSpin).direction = Vector3.Down()

// Set the click behavior for the wheels
wheel1.addComponent(
  new OnPointerDown(
    (e) => {
      const spin = wheel1.getComponent(WheelSpin)
      if (!spin.active) {
        spin.active = true
      } else {
        spin.speed += 20
      }
      //log("speed: ", spin.speed)
    },
    { button: ActionButton.POINTER, hoverText: 'Spin' }
  )
)

// wheel2.addComponent(
//   new OnPointerDown(
//     (e) => {
//       let spin = wheel2.getComponent(WheelSpin)
//       if (!spin.active) {
//         spin.active = true
//       } else {
//         spin.speed += 30
//       }
//       //log("speed: ", spin.speed)
//     },
//     { button: ActionButton.POINTER, hoverText: 'Spin' }
//   )
// )
