// Maps duct IDs to their image filenames
export const ductImageMap: Record<string, string> = {
  // Round > Elbows
  A7A: "3_to_5_piece_90_deg.png",
  A7B: "30_deg_offset.png",
  A7C: "round_elbow_mitered_with_converging_diverging_flow.png",

  // Round > Transitions (Diverging Flow)
  A8A: "conical_expansion.png",
  A8C: "round_to_rectangular_expansion.png",
  A8G: "asymmetric_at_fan_with_duct_sides_straight_top_level.png",
  A8H: "asymmetric_at_fan_with_duct_sides_straight_top_10_down.png",
  A8I: "asymmetric_at_fan_with_duct_sides_straight_top_10_up.png",

  // Round > Transitions (Converging Flow)
  A9A1: "conical_contraction.png",
  A9B1: "stepped_conical_contraction.png",
  A9D: "round_to_rectangular_contraction.png",

  // Round > Converging Junctions
  A10A: "converging_tee_round.png",
  A10B: "converging_round_wye.png",
  A10E: "converging_wye_conical.png",
  A10I1: "converging_45_wye_round.png",

  // Round > Diverging Junctions
  A11A: "tee_round_straight_main_conical_branch_0deg.png",
  A11B: "tee_round_straight_main_conical_branch_30deg.png",
  A11C: "diverging_conical_main_branch_45elbow_branch90.png",
  A11D: "tee_round_straight_main_conical_branch_60deg.png",
  A11E: "tee_round_straight_main_conical_branch_90deg.png",
  A11F: "tee_round_straight_main_tapered_branch_90deg.png",
  A11G: "diverging_45_conical_main_and_branch_45elbow_branch90.png",
  A11H: "wye_round_45deg_curved_main.png",
  A11I: "wye_round_45deg_rectangular_main.png",
  A11J: "diverging_45wye_rolled45_30elbow_branch45.png",
  A11K: "tee_rectangular_main_round_branch_conical.png",
  A11L: "wye_round_45deg_converging_reducer.png",
  A11M: "tee_round_tapered_main_round_branch_90deg.png",

  // Round > Entries
  A12A: "entry_round_free_discharge.png",
  A12B: "entry_round_flush.png",
  A12C: "entry_round_radiused.png",
  A12D: "entry_round_bellmouth.png",
  A12E: "entry_round_conical.png",
  A12F: "entry_round_intake_hood.png",
  A12G: "entry_hood_tapered_flanged_unflanged.png",

  // Rectangular > Elbows
  A7D: "mitered_rectangular.png",
  A7E: "mitered_with_converging_diverging_flow.png",
  A7F: "smooth_radius_without_vanes_90.png",
  A7G: "smooth_radius_with_splitter_vanes.png",
  A7H1: "mitered_with_single_thickness_turning_vanes.png",
  A7H2: "mitered_with_double_thickness_turning_vanes.png",
  A7I: "z_shaped.png",
  A7J: "different_planes.png",
  A7L: "tee_wye_elbow.png",

  // Rectangular > Transitions (Diverging Flow)
  A8B: "pyramidal_expansion.png",
  A8D: "rectangular_to_round_expansion.png",
  A8E: "rectangular_sides_straight.png",
  A8F: "symmetric_at_fan_with_duct_sides_straight.png",
  A8J: "pyramidal_at_fan_with_duct.png",

  // Rectangular > Transitions (Converging Flow)
  A9A2: "pyramidal_contraction.png",
  A9B2: "stepped_pyramidal_contraction.png",
  A9C: "rectangular_slot_to_round.png",

  // Rectangular > Converging Junctions
  A10C: "converging_tee_round_branch_to_rect_main.png",
  A10D: "converging_tee_rect_main_and_branch.png",
  A10F: "converging_tee_rect_45_entry_branch_to_main.png",
  A10G: "rect_converging_wye_symmetrical_dovetail.png",
  A10I2: "converging_rectangular_wye.png",

  // Rectangular > Diverging Junctions
  A11N: "diverging_tee_45entry_rect_main_and_branch.png",
  A11O: "diverging_tee_45entry_rect_main_and_branch_with_damper.png",
  A11P: "diverging_tee_rect_main_and_branch.png",
  A11Q: "diverging_tee_rect_main_and_branch_with_damper.png",
  A11R: "diverging_tee_rect_main_and_branch_with_extractor.png",
  A11S: "diverging_tee_rect_main_round_branch.png",
  A11T: "diverging_wye_rect.png",
  A11U: "diverging_tee_rect_main_conical_branch.png",
  A11V: "diverging_wye_rect_curved_branch.png",
  A11W: "diverging_rect_wye_dovetail.png",
};
