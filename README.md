# JS-Gravity
JS-Gravity is a simple javascript application that simulates planets movement in 2D space and their gravitational interaction. 
You can run it in your browser [here](http://nthend.github.io/js-gravity).

The applicatation numerically solves the gravity equation for N bodies:

![Gravity equation](http://nthend.github.io/js-gravity/img/gravity.png)

where **r** - position of object, *m* - mass of object, *i* or *k* - index of object, *G* - gravity constant. 

The new variable was introduced to transform this equation to be suitable for the numerical method we use. This splits our equation with second derivative into system of two equations with first derivatives:

![Splitted gravity equation](http://nthend.github.io/js-gravity/img/gravity-splitted.png)

you can think about **v** as a velocity of object.

*The* Runge-Kutta method (or RK4) is used to solve this system of two differential equations.
