const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 1024,
  xl: 1280,
};

const rawTheme = {
  breakpoints,
  subsystem: {
    simplePropertyA: "some_value",
    simplePropertyB: 400,
    extendPropertyA: {
      base: "some_value",
    },
    extendPropertyB: {
      base: 400,
    },
    withExtraProperties: {
      base: 400,
      extraPropertyA: 300,
      extraPropertyB: "extra_value",
      extraPropertyC: { a: 1, b: "2" },
      extraPropertyD: ["extra_value_1", "extra_value_2"],
      extraPropertyE: [200, 300],
      extraPropertyF: [{ a: 1, b: 2 }],
      extraPropertyG: () => {}, // a callback
    },
    withVariantsPropertyA: {
      base: "some_base_value",
      variants: {
        light: "some_light_value",
        heavy: {
          base: "some_heavy_value",
        },
      }
    },
    withVariantsPropertyB: {
      base: 400,
      variants: {
        light: 300,
        heavy: {
          base: 700,
        },
      }
    },
    withVariantsAndExtraProperty: {
      base: 400,
      extraProperty: 300,
      variants: {
        light: 300, // overrides only the base, extraProperty stay the same
        heavy: {
          base: 700,
          extraProperty: 600,
        },
      }
    },
    withResponsiveProperty: {
      base: 400,
      responsive: [
        { breakpoint: "lg", base: 700 }, // query by default is exact
        { breakpoint: "sm", query: "max", base: 300 }
      ]
    },
    withResponsiveAndExtraProperty: {
      base: 400,
      extraProperty: 300,
      responsive: [
        { breakpoint: "lg", base: 700 }, // Partial override
        { breakpoint: "sm", query: "max", base: 300, extraProperty: 200 } // Fully override
      ]
    },
    withResponsiveAndVariantsProperty: {
      base: 400,
      variants: {
        light: 300,
        heavy: 700,
      },
      responsive: [
        { breakpoint: "lg", variant: "heavy" }, // Reference the heavy variant
        { breakpoint: "sm", query: "max", base: 300 }
      ]
    },
    withResponsiveAndVariantsAndExtraProperty: {
      base: 400,
      extraProperty: 300,
      variants: {
        light: {
          base: 300,
          extraProperty: 200,
        },
        heavy: 700,
      },
      responsive: [
        { breakpoint: "lg", variant: "heavy", extraProperty: 400 }, // Reference the heavy variant and overrides extraProperty
        { breakpoint: "sm", query: "max", base: 300 }, // Partially override
        { breakpoint: "lg", target: "light", base: 400} // This breakpoint target the light variant. It will apply for that variant, and not for the base.
      ]
    },
    recipes: {
      groupA: {
        variantA: {
          recipePropertyA: "simple_property_a", // The example subsystem is targeting this property to token created from simplePropertyA
          recipePropertyB: "with_variants_property_a.light", // The example subsystem is targeting this property to token created from withVariantsPropertyA
          responsive: [
            { breakpoint: "lg", recipePropertyB: "with_variants_property_a.heavy" } // Partially override
          ],
        },
        variantB: {
          recipePropertyA: "simple_property_a", // The example subsystem is targeting this property to token created from simplePropertyA
          recipePropertyB: "with_variants_property_a.light", // The example subsystem is targeting this property to token created from withVariantsPropertyA
          responsive: [
            { breakpoint: "lg", variant: "variantA" } // Reference recipe variantA from the same group
          ],
        }
      },
    },
  },
};

module.exports = rawTheme;
