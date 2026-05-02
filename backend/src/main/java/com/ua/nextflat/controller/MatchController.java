package com.ua.nextflat.controller;

import com.ua.nextflat.dto.MatchResponseDTO;
import com.ua.nextflat.service.MatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matches")
@CrossOrigin(origins = "http://localhost:5173")
public class MatchController {

    private final MatchService matchService;

    @Autowired
    public MatchController(MatchService matchService) {
        this.matchService = matchService;
    }

    @GetMapping("/{usuarioId}")
    public ResponseEntity<List<MatchResponseDTO>> getMatchesForUser(@PathVariable Long usuarioId) {
        List<MatchResponseDTO> matches = matchService.getMatchesForUser(usuarioId);
        return ResponseEntity.ok(matches);
    }
}