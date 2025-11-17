// Maps duct IDs to their image filenames
export const ductImageMap: Record<string, string> = {
  // Round > Elbows
  A7A: "smooth_radius_90_deg.png",
  A7B: "3_to_5_piece_90_deg.png",
  A7C: "mitered_round.png",

  // Rectangular > Elbows
  A7D: "mitered_rectangular.png",
  A7E: "mitered_with_converging_diverging_flow.png",
  A7F: "smooth_radius_without_vanes_90.png",
  A7G: "smooth_radius_with_splitter_vanes.png",
  A7I: "z_shaped.png",
  A7J: "different_planes.png",

  // Round > Transitions (Diverging Flow)
  A8A: "conical_expansion.png",
  A8C: "round_to_rectangular_expansion.png",
  A8G: "asymmetric_at_fan_with_duct_sides_straight_top_level.png",
  A8H: "asymmetric_at_fan_with_duct_sides_straight_top_10_down.png",
  A8I: "asymmetric_at_fan_with_duct_sides_straight_top_10_up.png",

  // Rectangular > Transitions (Diverging Flow)
  A8B: "pyramidal_expansion.png",
  A8D: "rectangular_to_round_expansion.png",
  A8E: "rectangular_sides_straight.png",
  A8F: "symmetric_at_fan_with_duct_sides_straight.png",
  A8J: "pyramidal_at_fan_with_duct.png",

  // Round > Transitions (Converging Flow)
  A9A1: "conical_contraction.png",
  A9B1: "stepped_conical_contraction.png",
  A9C: "rectangular_slot_to_round.png",

  // Rectangular > Transitions (Converging Flow)
  A9A2: "pyramidal_contraction.png",
  A9B2: "stepped_pyramidal_contraction.png",

  // Round > Converging Junctions
  A10A1: "round_converging_tee.png",
  A10B: "round_converging_wye.png",
  A10E: "converging_wye_conical.png",
  A10I1: "round_converging_wye_conical.png",

  // Rectangular > Converging Junctions
  A10C: "converging_tee_round_branch_to_rect_main.png",
  A10D: "converging_tee_rect_main_and_branch.png",
  A10F: "converging_tee_rect_45_entry_branch_to_main.png",
  A10H: "rect_converging_wye_symmetrical_dovetail.png",
  A10I2: "converging_rectangular_wye.png",

  // Round > Diverging Junctions
  A11A: "diverging_conical_tee_90.png",
  A11C: "diverging_conical_main_branch_45elbow_branch90.png",
  A11E: "diverging_conical_tee_90.png",
  A11G: "diverging_45_conical_main_and_branch_45elbow_branch90.png",
  A11J: "diverging_45wye_rolled45_30elbow_branch45.png",

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

  // Round > Entries
  A12A1: "entry_round_duct_mounted_in_wall.png",
  A12A2: "entry_round_duct_mounted_in_wall.png",
  A12B: "entry_round_duct_mounted_in_wall.png",
  A12C: "entry_round_duct_mounted_in_wall.png",
  A12D1: "round_entry_conical_converging_bellmouth_with_end_wall.png",
  A12D2: "round_entry_conical_converging_bellmouth_without_end_wall.png",
  A12E1: "round_entry_conical_converging_bellmouth_with_end_wall.png",
  A12E2: "round_entry_conical_converging_bellmouth_without_end_wall.png",
  A12F: "round_entry_intake_hood.png",
  A12G: "entry_hood_tapered_flanged_unflanged.png",

  // Rectangular > Entries
  A13A: "entry_rect_duct_mounted_in_wall.png",
  A13B: "entry_rect_duct_mounted_in_wall.png",
  A13C: "entry_rect_duct_mounted_in_wall.png",
  A13D: "entry_rect_duct_mounted_in_wall.png",
  A13E1: "rect_entry_conical_converging_bellmouth_with_end_wall.png",
  A13E2: "rect_entry_conical_converging_bellmouth_without_end_wall.png",
  A13F1: "rect_entry_conical_converging_bellmouth_with_end_wall.png",
  A13F2: "rect_entry_conical_converging_bellmouth_without_end_wall.png",
  A13G: "entry_hood_tapered_flanged_unflanged.png",
  A13H: "exhaust_hood.png",

  // Round > Dampers/Obstructions
  A14A1: "round_screen_in_duct.png",
  A14A2: "round_screen_in_duct.png",
  A14B1: "round_perf_plate_in_duct.png",
  A14B2: "round_perf_plate_in_duct.png",

  // Round > Exits
  A15A: "exit_round_duct_flush_with_wall.png",
  A15B: "exit_abrupt_round_with_without_wall.png",
  A15C: "round_gate_damper.png",
  A15D: "exit_round_discharge_to_atm_from_90elbow.png",
  A15E: "exhaust_conical_round_with_without_wall.png",
  A15F: "exit_plane_diffuser_rect_with_without_wall.png",
  A15G: "exit_plane_asymmetric_diffuser_at_outlet_without_ductwork.png",
  A15H1: "exit_pyramidal_diffuser_at_fan_outlet_without_ductwork.png",
  A15H2: "exit_pyramidal_diffuser_rect_with_without_wall.png",
};
