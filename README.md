JS-Gravity is a javascript application that simulates planets movement in 2D space and their gravitational interaction.

The applicatation numerically solves the gravity equation for N bodies:
r_k'' = sum i!=k G*m_i*r_i/abs(r_i)^3;

To transform this equation to be suitable for the Runge-Kutta method we introduce new variable v_k:
r_k' = v_k;
v_k' = sum i!=k G*m_i*r_i/abs(r_i)^3;

The Runge-Kutta method (or RK4) are used to solve this system of two differential equations.