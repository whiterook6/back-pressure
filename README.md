Players place and connect components in an input-output relation, with the output of one component feeding into the input of another (or possibly the same)
Components generate, consume, or otherwise alter streams of input and output.
Pulsar takes a steady flow as input and produces pulses of flow as output
Reservoir takes any flow as input and produces steady flow as output, either requires full or not
Converter takes one color flow and produces a different color flow
Gates that require steady flow or built up reservoir
Play on efficiencies
Some components function at slightly higher than 100% efficiency, others much lower, and combinations might give free flow
Limited starting reservoir adds possibility of failure
Different flow colors that have different properties; brightness of flow is amount (never black or white)
Initial Conditions matter
Sometimes predictable results, sometimes unexpected, depending on initial conditions, error tolerances, etc.
Base puzzles off of real life
Spend fun for exercise, get strength; high enough strength, and activities unlock for more fun; limited fun reservoir
Aim for “simpler is more efficient”
Reminiscent of pipe dream?
Gameplay: search for appropriate pieces, limited time, rush against flow

Component:
Double buffered
Has some outputs
Might point to some other components’ outputs to use as inputs
Each output is pointed to by at most one component
Each frame, each component clears its pointed-to components’ back-buffer outputs, and produces new front-end output
